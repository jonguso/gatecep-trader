export function prepareNotifications(events = []) {
  return events.map((event) => ({
    id: event.id,
    userId: event.userId,
    title: event.title,
    message: event.message,
    severity: event.severity,
    source: event.source,
    createdAt: event.createdAt,
    deliveryStatus: "PENDING"
  }));
}