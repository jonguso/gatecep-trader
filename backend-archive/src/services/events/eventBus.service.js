import { redis } from "../../config/redis.js";

const localSubscribers = {};

export async function publishEvent(channel, payload) {
  const event = {
    channel,
    payload,
    timestamp: new Date().toISOString()
  };

  if (redis) {
    await redis.publish(channel, JSON.stringify(event));
  }

  if (localSubscribers[channel]) {
    for (const handler of localSubscribers[channel]) {
      handler(event);
    }
  }

  return event;
}

export function subscribeEvent(channel, handler) {
  if (!localSubscribers[channel]) {
    localSubscribers[channel] = [];
  }

  localSubscribers[channel].push(handler);

  if (redis) {
    const subscriber = redis.duplicate();

    subscriber.subscribe(channel);

    subscriber.on("message", (_, message) => {
      handler(JSON.parse(message));
    });
  }
}