import { state, audit } from "../store/state.js";

export function clearPendingOrders(req, res) {
  const { userId } = req.body;
  const pendingStatuses = ["PENDING", "OPEN", "ROUTED", "ACCEPTED"];

  let cleared = 0;

  state.orderLog = (state.orderLog || []).map(order => {
    const matchUser = !userId || order.userId === userId;
    const isPending = pendingStatuses.includes(String(order.status || "").toUpperCase());

    if (matchUser && isPending) {
      cleared += 1;
      return {
        ...order,
        status: "CANCELLED",
        cancelledAt: new Date().toISOString(),
        cancelReason: "Cleared pending demo order"
      };
    }

    return order;
  });

  audit("PENDING_ORDERS_CLEARED", `Cleared ${cleared} pending orders`, userId || null);
  res.json({ message: "Pending orders cleared", cleared });
}
