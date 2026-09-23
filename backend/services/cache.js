// Tiny in-memory TTL cache. Keeps repeated dashboard loads from hammering
// Open-Meteo, which also keeps us inside their fair-use limits.
const store = new Map();

function get(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

function set(key, value, ttlSeconds = 300) {
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  return value;
}

async function wrap(key, ttlSeconds, producer) {
  const cached = get(key);
  if (cached !== null) return cached;
  const value = await producer();
  return set(key, value, ttlSeconds);
}

function clear() { store.clear(); }
function stats() { return { entries: store.size }; }

// Periodic sweep so long-running servers do not grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(key);
  }
}, 10 * 60 * 1000).unref?.();

module.exports = { get, set, wrap, clear, stats };
