/**
 * Weather RAG (retrieval augmented generation).
 *
 * Design goals: no native modules, no GPU, works offline on Windows.
 *  - Knowledge base lives in /rag/documents as plain Markdown.
 *  - `node rag/buildKnowledgeBase.js` chunks it and writes a JSON vector
 *    store to /rag/embeddings/knowledge-base.json.
 *  - Embeddings come from the Gemini embedding API when a key is present,
 *    otherwise from a deterministic local hashing embedder (no network).
 *  - Retrieval scores cosine similarity and blends in a lexical score so
 *    the results stay sensible either way.
 */

const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const logger = require('../utils/logger');

const KB_PATH = path.join(__dirname, '..', '..', 'rag', 'embeddings', 'knowledge-base.json');
const DOCS_DIR = path.join(__dirname, '..', '..', 'rag', 'documents');
const LOCAL_DIM = 512;

const STOPWORDS = new Set(
  ('a an and are as at be by for from has have how in is it its of on or that the this to was what when where which who will with your you i my me do does can should '
    + 'about there their they them then than').split(' ')
);

let knowledgeBase = null;

/* ------------------------------ tokenising ------------------------------ */

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s°%.-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/** Stable string hash (FNV-1a) so the local embedder is reproducible. */
function hashToken(token) {
  let h = 0x811c9dc5;
  for (let i = 0; i < token.length; i += 1) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return Math.abs(h);
}

/** Deterministic offline embedding: hashed bag of words with sublinear term frequency. */
function localEmbed(text) {
  const vec = new Array(LOCAL_DIM).fill(0);
  const tokens = tokenize(text);
  const counts = new Map();
  tokens.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));

  for (const [token, count] of counts.entries()) {
    const weight = 1 + Math.log(count);
    vec[hashToken(token) % LOCAL_DIM] += weight;
    // A second bucket from a bigram of the token reduces hash collisions.
    vec[hashToken(`${token}#2`) % LOCAL_DIM] += weight * 0.5;
  }

  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

/* ------------------------------ embedding ------------------------------- */

async function geminiEmbed(text) {
  // Required lazily so the local (offline) embedder works before `npm install`.
  // eslint-disable-next-line global-require
  const axios = require('axios');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_EMBEDDING_MODEL}:embedContent`;
  const { data } = await axios.post(
    url,
    {
      model: `models/${env.GEMINI_EMBEDDING_MODEL}`,
      content: { parts: [{ text: String(text).slice(0, 8000) }] },
    },
    { params: { key: env.GEMINI_API_KEY }, timeout: 20000 }
  );
  const values = data?.embedding?.values;
  if (!Array.isArray(values)) throw new Error('Embedding API returned no vector');
  const norm = Math.sqrt(values.reduce((s, v) => s + v * v, 0)) || 1;
  return values.map((v) => v / norm);
}

/**
 * @param {string} text
 * @param {'gemini'|'local'|'auto'} method
 */
async function embedText(text, method = 'auto') {
  const resolved = method === 'auto' ? (env.geminiConfigured ? 'gemini' : 'local') : method;
  if (resolved === 'gemini') {
    try {
      return { vector: await geminiEmbed(text), method: 'gemini' };
    } catch (err) {
      logger.warn(`Gemini embedding failed (${err.message}); falling back to the local embedder.`);
      return { vector: localEmbed(text), method: 'local' };
    }
  }
  return { vector: localEmbed(text), method: 'local' };
}

/* ------------------------------ knowledge base --------------------------- */

/** Split a Markdown document into retrieval-sized chunks on headings/paragraphs. */
function chunkDocument(markdown, { maxChars = 900 } = {}) {
  const blocks = markdown.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const chunks = [];
  let buffer = '';
  let heading = '';

  for (const block of blocks) {
    if (/^#{1,6}\s/.test(block)) {
      if (buffer.trim()) chunks.push({ heading, text: buffer.trim() });
      heading = block.replace(/^#{1,6}\s/, '').trim();
      buffer = '';
      continue;
    }
    if ((buffer + '\n\n' + block).length > maxChars && buffer) {
      chunks.push({ heading, text: buffer.trim() });
      buffer = block;
    } else {
      buffer = buffer ? `${buffer}\n\n${block}` : block;
    }
  }
  if (buffer.trim()) chunks.push({ heading, text: buffer.trim() });
  return chunks;
}

function readDocuments() {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(DOCS_DIR, file), 'utf8');
      const titleMatch = raw.match(/^#\s+(.+)$/m);
      const sourceMatch = raw.match(/^>\s*Source:\s*(.+)$/m);
      return {
        file,
        title: titleMatch ? titleMatch[1].trim() : file.replace(/\.md$/, ''),
        source: sourceMatch ? sourceMatch[1].trim() : 'WeatherGPT Knowledge Base',
        content: raw,
      };
    });
}

/** Build the vector store. Used by rag/buildKnowledgeBase.js and by the lazy fallback. */
async function buildKnowledgeBase({ method = 'auto', write = true, onProgress } = {}) {
  const docs = readDocuments();
  if (!docs.length) throw new Error(`No knowledge documents found in ${DOCS_DIR}`);

  const entries = [];
  let usedMethod = method === 'auto' ? (env.geminiConfigured ? 'gemini' : 'local') : method;

  for (const doc of docs) {
    const chunks = chunkDocument(doc.content);
    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];
      const text = chunk.heading ? `${chunk.heading}\n${chunk.text}` : chunk.text;
      // eslint-disable-next-line no-await-in-loop
      const { vector, method: actual } = await embedText(text, usedMethod);
      usedMethod = actual;
      entries.push({
        id: `${doc.file}#${i}`,
        docTitle: doc.title,
        heading: chunk.heading || doc.title,
        source: doc.source,
        file: doc.file,
        text: chunk.text,
        tokens: Array.from(new Set(tokenize(`${doc.title} ${text}`))),
        vector,
      });
      if (onProgress) onProgress(entries.length, doc.title);
    }
  }

  // Inverse document frequency across chunks: rare words like "lightning"
  // should count far more than common ones like "weather".
  const df = new Map();
  entries.forEach((e) => e.tokens.forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  const idf = {};
  df.forEach((count, token) => {
    idf[token] = Math.log(1 + entries.length / count);
  });

  const kb = {
    version: 1,
    method: usedMethod,
    idf,
    dimension: entries[0]?.vector.length || LOCAL_DIM,
    builtAt: new Date().toISOString(),
    documents: docs.map((d) => ({ file: d.file, title: d.title, source: d.source })),
    entries,
  };

  if (write) {
    fs.mkdirSync(path.dirname(KB_PATH), { recursive: true });
    fs.writeFileSync(KB_PATH, JSON.stringify(kb));
  }
  knowledgeBase = kb;
  return kb;
}

function loadKnowledgeBase() {
  if (knowledgeBase) return knowledgeBase;
  try {
    if (fs.existsSync(KB_PATH)) {
      knowledgeBase = JSON.parse(fs.readFileSync(KB_PATH, 'utf8'));
      logger.info(`RAG knowledge base loaded: ${knowledgeBase.entries.length} chunks (${knowledgeBase.method} embeddings).`);
      return knowledgeBase;
    }
  } catch (err) {
    logger.warn(`Could not read the knowledge base file: ${err.message}`);
  }
  return null;
}

/** Called once at startup: loads the store, or builds a local one if missing. */
async function initRAG() {
  if (loadKnowledgeBase()) return knowledgeBase;
  try {
    logger.warn('No prebuilt knowledge base found. Building one locally (no network needed)...');
    const kb = await buildKnowledgeBase({ method: 'local', write: true });
    logger.info(`RAG knowledge base built: ${kb.entries.length} chunks.`);
    return kb;
  } catch (err) {
    logger.error(`RAG initialisation failed: ${err.message}`);
    return null;
  }
}

/* -------------------------------- search -------------------------------- */

function cosine(a, b) {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < len; i += 1) dot += a[i] * b[i];
  return dot; // both vectors are already L2-normalised
}

function lexicalScore(queryTokens, entry, idf = {}) {
  if (!queryTokens.length || !entry?.tokens?.length) return 0;
  const set = new Set(entry.tokens);
  const headingTokens = new Set(tokenize(entry.heading || ''));
  const weight = (t) => idf[t] ?? 1;

  let matched = 0;
  let total = 0;
  for (const token of queryTokens) {
    const w = weight(token);
    total += w;
    if (set.has(token)) matched += w * (headingTokens.has(token) ? 1.6 : 1);
  }
  return total ? Math.min(1, matched / total) : 0;
}

/**
 * Retrieve the most relevant knowledge chunks for a query.
 * Never throws: on failure it returns an empty result so the chat still works.
 */
async function search(query, { topK = 4, minScore = 0.08 } = {}) {
  const kb = loadKnowledgeBase() || (await initRAG());
  if (!kb || !kb.entries?.length) return { results: [], method: 'unavailable' };

  try {
    const queryTokens = tokenize(query);
    const { vector, method } = await embedText(query, kb.method === 'gemini' ? 'gemini' : 'local');
    const compatible = method === kb.method && vector.length === kb.dimension;

    const scored = kb.entries.map((entry) => {
      const vectorScore = compatible ? cosine(vector, entry.vector) : 0;
      const lexical = lexicalScore(queryTokens, entry, kb.idf);
      const blend = kb.method === 'gemini' ? 0.75 : 0.35; // Gemini vectors are far stronger
      return { entry, score: compatible ? blend * vectorScore + (1 - blend) * lexical : lexical };
    });

    scored.sort((a, b) => b.score - a.score);

    const results = scored
      .filter((s) => s.score >= minScore)
      .slice(0, topK)
      .map(({ entry, score }) => ({
        id: entry.id,
        title: entry.docTitle,
        heading: entry.heading,
        source: entry.source,
        text: entry.text,
        score: Number(score.toFixed(4)),
      }));

    return { results, method: compatible ? kb.method : 'lexical' };
  } catch (err) {
    logger.warn(`RAG search failed: ${err.message}`);
    return { results: [], method: 'unavailable' };
  }
}

/** Format retrieved chunks as grounded context for the model prompt. */
function toContextBlock(results) {
  if (!results?.length) return '';
  return results
    .map((r, i) => `[KB${i + 1}] ${r.heading} (${r.title})\n${r.text}`)
    .join('\n\n');
}

function getStatus() {
  const kb = loadKnowledgeBase();
  return {
    ready: Boolean(kb),
    method: kb?.method || null,
    chunks: kb?.entries?.length || 0,
    documents: kb?.documents?.length || 0,
    builtAt: kb?.builtAt || null,
  };
}

module.exports = {
  search,
  initRAG,
  buildKnowledgeBase,
  loadKnowledgeBase,
  embedText,
  localEmbed,
  chunkDocument,
  tokenize,
  toContextBlock,
  getStatus,
  KB_PATH,
  DOCS_DIR,
};
