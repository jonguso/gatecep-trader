import { userGetItem, userSetItem } from "../auth/userStorage";

const EXECUTION_AUDIT_KEY = "executionAuditTrail";

export async function loadExecutionAuditTrail() {
  const raw = await userGetItem(EXECUTION_AUDIT_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addExecutionAuditEvent({
  executionId = null,
  orderId = null,
  symbol = "",
  eventType = "INFO",
  status = "",
  message = "",
  brokerId = null,
  brokerName = null,
  brokerOrderId = null,
  payload = {}
} = {}) {
  const events = await loadExecutionAuditTrail();

  const event = {
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    executionId,
    orderId,
    symbol,
    eventType,
    status,
    message,
    brokerId,
    brokerName,
    brokerOrderId,
    payload,
    createdAt: new Date().toISOString()
  };

  const next = [event, ...events].slice(0, 1000);

  await userSetItem(EXECUTION_AUDIT_KEY, JSON.stringify(next));

  return event;
}

export async function clearExecutionAuditTrail() {
  await userSetItem(EXECUTION_AUDIT_KEY, "");
}

export function filterAuditTrail(events = [], filters = {}) {
  return events.filter((event) => {
    if (filters.executionId && event.executionId !== filters.executionId) {
      return false;
    }

    if (filters.orderId && event.orderId !== filters.orderId) {
      return false;
    }

    if (
      filters.symbol &&
      String(event.symbol || "").toUpperCase() !==
        String(filters.symbol || "").toUpperCase()
    ) {
      return false;
    }

    if (filters.status && event.status !== filters.status) {
      return false;
    }

    return true;
  });
}