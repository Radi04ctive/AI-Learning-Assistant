import Redis from "ioredis";

// Singleton ioredis client used for token blacklist lookups.
// Reads REDIS_URL (set by docker-compose for the full stack; defaults to
// localhost:6379 for local `pnpm dev` runs against backend/docker-compose.yml).
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let redis = null;

export const connectRedis = () => {
  if (redis) return redis;

  redis = new Redis(redisUrl, {
    // Keep reconnect attempts gentle so a Redis outage doesn't crash the app.
    retryStrategy: (times) => Math.min(times * 200, 2000),
    maxRetriesPerRequest: 1,
    lazyConnect: false,
  });

  redis.on("connect", () => {
    console.log("Redis Connected");
  });

  redis.on("error", (err) => {
    // Logged but not fatal: see the fail-open note in middleware/auth.js.
    console.error(`Redis error: ${err.message}`);
  });

  return redis;
};

export const getRedis = () => {
  if (!redis) {
    return connectRedis();
  }
  return redis;
};

export default getRedis;
