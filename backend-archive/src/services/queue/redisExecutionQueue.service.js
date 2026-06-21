import { redis } from "../../config/redis.js";

const memoryJobs = [];
const memoryEvents = [];

export async function enqueueExecutionJob(order) {
  const job = {
    id: `JOB-${Date.now()}`,
    orderId: order.id,
    order,
    status: "PENDING",
    createdAt: new Date().toISOString()
  };

  const event = {
    type: "JOB_QUEUED",
    jobId: job.id,
    orderId: order.id,
    timestamp: new Date().toISOString()
  };

  if (!redis) {
    memoryJobs.unshift(job);
    memoryEvents.unshift(event);
    return job;
  }

  await redis.lpush("gatecep:execution:queue", JSON.stringify(job));
  await redis.lpush("gatecep:execution:events", JSON.stringify(event));

  return job;
}

export async function getExecutionJobs() {
  if (!redis) return memoryJobs.slice(0, 100);

  const rows = await redis.lrange("gatecep:execution:queue", 0, 100);
  return rows.map((row) => JSON.parse(row));
}

export async function getExecutionEvents() {
  if (!redis) return memoryEvents.slice(0, 100);

  const rows = await redis.lrange("gatecep:execution:events", 0, 100);
  return rows.map((row) => JSON.parse(row));
}