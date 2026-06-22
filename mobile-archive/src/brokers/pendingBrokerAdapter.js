export function createPendingApiResponse(
  brokerId,
  brokerName,
  order = {},
  status = "MANUAL_CONFIRMATION_REQUIRED"
) {
  return {
    ok: false,
    brokerId,
    brokerName,
    brokerOrderId: null,
    status,
    submittedAt: new Date().toISOString(),
    receivedAt: null,
    message: `${brokerName} API is not connected yet. Manual broker confirmation required.`,
    order: {
      ...order,
      brokerId,
      brokerName,
      brokerStatus: status
    }
  };
}