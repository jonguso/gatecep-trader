import { state, audit } from "../store/state.js";
import { getLedgerRows, getBalances as buildBalances, releaseOrderLock } from "../services/accounting/accountingEngine.js";

export function getLedger(req, res) {
  const userId = req.query.userId;
  res.json(getLedgerRows(userId));
}

export function getBalances(req, res) {
  try {
    const userId = req.params.userId;
    res.json(buildBalances(userId, Number(req.query.holdingsCurrentValue || 0)));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function clearPendingOrders(req, res) {
  const { userId } = req.body;
  const pendingStatuses = ["PENDING", "OPEN", "ROUTED", "ACCEPTED"];
  let cleared = 0;
  let released = 0;

  state.orderLog = (state.orderLog || []).map(order => {
    const matchUser = !userId || order.userId === userId;
    const isPending = pendingStatuses.includes(String(order.status || "").toUpperCase());

    if (matchUser && isPending) {
      cleared += 1;
      released += releaseOrderLock({
        userId: order.userId,
        orderId: order.id,
        reason: "User cleared pending order"
      });

      return {
        ...order,
        status: "CANCELLED",
        cancelledAt: new Date().toISOString(),
        cancelReason: "User cleared pending order"
      };
    }

    return order;
  });

  audit("PENDING_ORDERS_CLEARED", `Cleared ${cleared} pending orders and released KES ${released}`, userId || null);

  res.json({
    message: "Pending orders cleared",
    cleared,
    released: Number(released.toFixed(2))
  });
}
