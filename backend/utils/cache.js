import Redis from "ioredis";
import logger from "./logger.js";

/**
 * Redis Caching Utility — Distributed caching layer for the Teyvat Takeout API.
 *
 * Features:
 * - Lazy connection with graceful degradation (fails open, never blocks API)
 * - TTL-based cache invalidation
 * - Namespace-based key management for easy group invalidation
 * - Cache-Aside pattern for food catalog and category lists
 *
 * Cache Namespaces:
 *   food:list        — Full menu catalog (TTL: 5 min)
 *   food:category:*  — Category-filtered food lists (TTL: 5 min)
 *   category:list    — All categories (TTL: 10 min)
 */

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const DEFAULT_TTL = 300; // 5 minutes in seconds

let redisClient = null;
let redisAvailable = false;

const connectRedis = () => {
  try {
    const client = new Redis(REDIS_URL, {
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false
    });

    client.on("connect", () => {
      redisAvailable = true;
      logger.info("Redis cache connected", { url: REDIS_URL });
    });

    client.on("error", (err) => {
      if (redisAvailable) {
        logger.warn("Redis connection error — falling back to no-cache mode", {
          error: err.message
        });
      }
      redisAvailable = false;
    });

    client.on("close", () => {
      redisAvailable = false;
    });

    client.connect().catch(() => {
      logger.warn("Redis unavailable — API will run without caching");
      redisAvailable = false;
    });

    return client;
  } catch (err) {
    logger.warn("Redis initialization failed — running without cache", { error: err.message });
    return null;
  }
};

redisClient = connectRedis();

/**
 * Retrieve a cached value by key. Returns null on miss or Redis error.
 */
export const cacheGet = async (key) => {
  if (!redisAvailable || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.warn("Cache GET failed", { key, error: err.message });
    return null;
  }
};

/**
 * Store a value in cache with a TTL (seconds). Silently fails if Redis is down.
 */
export const cacheSet = async (key, value, ttl = DEFAULT_TTL) => {
  if (!redisAvailable || !redisClient) return;
  try {
    await redisClient.setex(key, ttl, JSON.stringify(value));
  } catch (err) {
    logger.warn("Cache SET failed", { key, error: err.message });
  }
};

/**
 * Delete a single cache key. Used for targeted invalidation.
 */
export const cacheDel = async (key) => {
  if (!redisAvailable || !redisClient) return;
  try {
    await redisClient.del(key);
  } catch (err) {
    logger.warn("Cache DEL failed", { key, error: err.message });
  }
};

/**
 * Invalidate all cache keys matching a pattern (e.g., "food:*").
 * Used when food/category data is mutated to ensure stale data is cleared.
 */
export const cacheInvalidatePattern = async (pattern) => {
  if (!redisAvailable || !redisClient) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.info("Cache invalidated", { pattern, keysDeleted: keys.length });
    }
  } catch (err) {
    logger.warn("Cache pattern invalidation failed", { pattern, error: err.message });
  }
};

// Cache key constants — centralized to prevent typos
export const CACHE_KEYS = {
  FOOD_LIST: "food:list",
  CATEGORY_LIST: "category:list",
  FOOD_BY_CATEGORY: (cat) => `food:category:${cat}`
};

export const isRedisAvailable = () => redisAvailable;

export default redisClient;
