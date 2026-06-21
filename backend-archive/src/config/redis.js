import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

export const redis = REDIS_URL
  ? new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        return Math.min(times * 200, 2000);
      }
    })
  : null;

if (redis) {
 
  redis.on("connect", () => {
    console.log("Redis connected");
  });

  redis.on("error", (error) => {
    console.error("Redis error:", error.message);
  });
} else {
  console.log("Redis disabled: REDIS_URL not configured");
}