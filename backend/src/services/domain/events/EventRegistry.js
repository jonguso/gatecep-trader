import { randomUUID } from "crypto";

export function createEvent({
  type,
  userId,
  severity = "LOW",
  title,
  message,
  source = "Gatecep",
  metadata = {}
}) {
  return {
    id: randomUUID(),
    type,
    userId,
    severity,
    title,
    message,
    source,
    metadata,
    acknowledged: false,
    createdAt: new Date().toISOString()
  };
}