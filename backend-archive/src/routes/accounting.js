import { state } from "../store/state.js";
import { getBalances as buildBalances } from "../services/accounting/accountingEngine.js";

export function getLedger(req, res) {
  res.json((state.ledger || []).filter(x => !req.query.userId || x.userId === req.query.userId));
}

export function getBalances(req, res) {
  res.json(buildBalances(req.params.userId, Number(req.query.holdingsCurrentValue || 0)));
}

export function clearPendingOrders(req, res) {
  const { userId } = req.body;
  let cleared = 0;
  state.orderLog = (state.orderLog || []).map(o => {
    if ((!userId || o.userId === userId) && ["PENDING","OPEN","ROUTED","ACCEPTED"].includes(String(o.status).toUpperCase())) {
      cleared++;
      return { ...o, status: "CANCELLED", cancelledAt: new Date().toISOString() };
    }
    return o;
  });
  res.json({ message: "Pending orders cleared", cleared });
}
