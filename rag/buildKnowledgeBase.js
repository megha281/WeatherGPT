#!/usr/bin/env node
/**
 * Builds the WeatherGPT vector knowledge base.
 *
 *   node rag/buildKnowledgeBase.js            # auto: Gemini embeddings if a key is set
 *   node rag/buildKnowledgeBase.js --local    # force the offline embedder (no network)
 *   node rag/buildKnowledgeBase.js --gemini   # force Gemini embeddings
 *
 * Reads every Markdown file in rag/documents, splits it into chunks and
 * writes rag/embeddings/knowledge-base.json.
 */

const path = require('path');
const rag = require('../backend/services/ragService');
const env = require('../backend/config/env');

const args = process.argv.slice(2);
const method = args.includes('--local') ? 'local' : args.includes('--gemini') ? 'gemini' : 'auto';

(async () => {
  const chosen = method === 'auto' ? (env.geminiConfigured ? 'gemini' : 'local') : method;
  console.log('WeatherGPT :: building the weather knowledge base');
  console.log(`  documents : ${path.relative(process.cwd(), rag.DOCS_DIR)}`);
  console.log(`  embeddings: ${chosen}${chosen === 'local' ? ' (offline hashing embedder)' : ' (Gemini embedding API)'}`);

  if (chosen === 'gemini' && !env.geminiConfigured) {
    console.error('  GEMINI_API_KEY is not set. Run with --local or add the key to backend/.env');
    process.exit(1);
  }

  try {
    const kb = await rag.buildKnowledgeBase({
      method,
      write: true,
      onProgress: (count, title) => {
        if (count % 5 === 0) process.stdout.write(`\r  chunks embedded: ${count} (${title})            `);
      },
    });
    process.stdout.write('\r');
    console.log(`  done. ${kb.entries.length} chunks from ${kb.documents.length} documents.`);
    console.log(`  written to ${path.relative(process.cwd(), rag.KB_PATH)}`);

    const demo = await rag.search('what should I do during a thunderstorm', { topK: 2 });
    console.log(`  smoke test ("thunderstorm safety") -> ${demo.results.length} chunk(s) retrieved via ${demo.method}.`);
    demo.results.forEach((r) => console.log(`    - ${r.heading} [score ${r.score}]`));
  } catch (err) {
    console.error(`  build failed: ${err.message}`);
    process.exit(1);
  }
})();
