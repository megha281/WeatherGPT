const rag = require('../services/ragService');

jest.setTimeout(60000);

describe('weather knowledge base', () => {
  test('retrieves lightning guidance for a thunderstorm question', async () => {
    const { results } = await rag.search('what should I do when there is lightning nearby', { topK: 3 });
    expect(results.length).toBeGreaterThan(0);
    const text = results.map((r) => `${r.title} ${r.text}`).join(' ').toLowerCase();
    expect(text).toMatch(/lightning|thunderstorm|shelter|indoors/);
  });

  test('retrieves the weather versus climate explanation', async () => {
    const { results } = await rag.search('difference between weather and climate', { topK: 3 });
    expect(results.some((r) => /climate/i.test(r.title))).toBe(true);
  });

  test('results carry a source label', async () => {
    const { results } = await rag.search('rainfall categories in India', { topK: 2 });
    results.forEach((r) => expect(typeof r.source).toBe('string'));
  });

  test('an unrelated question returns nothing rather than a bad match', async () => {
    const { results } = await rag.search('zzzz qqqq vvvv', { topK: 3, minScore: 0.2 });
    expect(results.length).toBe(0);
  });

  test('the local embedder is deterministic and normalised', () => {
    const a = rag.localEmbed('heavy rainfall warning');
    const b = rag.localEmbed('heavy rainfall warning');
    expect(a).toEqual(b);
    const norm = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    expect(norm).toBeCloseTo(1, 5);
  });
});
