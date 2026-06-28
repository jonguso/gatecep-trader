import Redis from "ioredis";

let redis = null;

export function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true
    });

    redis.on("connect", () => {
      console.log("Redis connected");
    });

    redis.on("error", (error) => {
      console.log("Redis error:", error.message);
    });
  }

  return redis;
}

export async function startRedis() {
  const client = getRedisClient();

  if (!client) {
    console.log("Redis disabled: REDIS_URL not set");
    return null;
  }

  try {
    await client.connect();
    return client;
  } catch (error) {
    console.log("Redis start failed:", error.message);
    return null;
  }
}