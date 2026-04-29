/**
 * A simple in-memory cache to speed up API responses
 * Prevents redundant BigQuery and OpenAI calls for repeated navigation
 */

const cacheStore = new Map();

// Default Time-To-Live (TTL) is 5 minutes
const DEFAULT_TTL_MS = 5 * 60 * 1000;

function getCache(key) {
  const item = cacheStore.get(key);
  if (!item) return null;

  // Check if expired
  if (Date.now() > item.expiry) {
    cacheStore.delete(key);
    return null;
  }
  
  return item.value;
}

function setCache(key, value, ttlMs = DEFAULT_TTL_MS) {
  cacheStore.set(key, {
    value,
    expiry: Date.now() + ttlMs,
  });
}

function clearCache() {
  cacheStore.clear();
}

module.exports = {
  getCache,
  setCache,
  clearCache
};
