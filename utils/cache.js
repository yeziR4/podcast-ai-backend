import NodeCache from 'node-cache';

// Create cache instance
// TTL: Time to live in seconds (default 1 hour)
const TTL = parseInt(process.env.CACHE_TTL) || 3600;

export const cache = new NodeCache({
  stdTTL: TTL,
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false
});

// Log cache statistics periodically
setInterval(() => {
  const stats = cache.getStats();
  if (stats.keys > 0) {
    console.log(`\n💾 Cache Stats: ${stats.keys} keys, ${stats.hits} hits, ${stats.misses} misses`);
  }
}, 300000); // Every 5 minutes

console.log(`✅ Cache initialized (TTL: ${TTL}s)`);
