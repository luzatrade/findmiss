// Cache Service - Opzionale (richiede Redis)
// Se Redis non è disponibile, le funzioni sono no-op

let redis = null;

// Inizializza connessione Redis (opzionale)
const initRedis = () => {
  if (process.env.REDIS_URL) {
    try {
      const Redis = require('ioredis');
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        lazyConnect: true
      });

      redis.on('connect', () => {
        console.log('✅ Redis connesso');
      });

      redis.on('error', (err) => {
        console.warn('⚠️ Redis error:', err.message);
        redis = null;
      });

      redis.connect().catch(() => {
        console.warn('⚠️ Redis non disponibile, cache disabilitata');
        redis = null;
      });
    } catch (error) {
      console.warn('⚠️ Redis non configurato:', error.message);
      redis = null;
    }
  } else {
    console.log('ℹ️ Redis non configurato, cache disabilitata');
  }
  return redis;
};

// Default TTL (in secondi)
const DEFAULT_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  DAY: 86400
};

// Get from cache
const get = async (key) => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

// Set in cache
const set = async (key, value, ttl = DEFAULT_TTL.MEDIUM) => {
  if (!redis) return false;
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
};

// Delete from cache
const del = async (key) => {
  if (!redis) return false;
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    return false;
  }
};

// Cache wrapper
const cacheWrapper = async (key, ttl, fetchFn) => {
  const cached = await get(key);
  if (cached) return cached;
  const data = await fetchFn();
  await set(key, data, ttl);
  return data;
};

module.exports = {
  initRedis,
  get,
  set,
  del,
  cacheWrapper,
  DEFAULT_TTL
};

