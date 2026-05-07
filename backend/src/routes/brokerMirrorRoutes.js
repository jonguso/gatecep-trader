import express from "express";
import { getBrokerAdapter, getSupportedBrokerIds } from "../brokerAdapters/BrokerAdapterFactory.js";

export const brokerMirrorRouter = express.Router();

function defaultLinkedAccounts(userId) {
  return [
    { userId, brokerId: "aib", brokerName: "AIB-AXYS Africa", accountNumber: "AIB-DEMO-001", status: "LINKED" },
    { userId, brokerId: "abc", brokerName: "ABC Capital", accountNumber: "ABC-DEMO-001", status: "LINKED" }
  ];
}

async function collectFromBrokers(userId, method) {
  const accounts = defaultLinkedAccounts(userId);
  const results = [];

  for (const account of accounts) {
    const adapter = getBrokerAdapter(account.brokerId);
    results.push(await adapter[method](account));
  }

  return results;
}

brokerMirrorRouter.get("/brokers", (req, res) => {
  res.json({ data: getSupportedBrokerIds() });
});

brokerMirrorRouter.get("/portfolio/:userId", async (req, res) => {
  try {
    const brokerPortfolios = await collectFromBrokers(req.params.userId, "getPortfolio");
    const holdings = brokerPortfolios.flatMap(p =>
      p.holdings.map(h => ({
        ...h,
        brokerId: p.brokerId,
        brokerName: p.brokerName,
        accountNumber: p.accountNumber,
        marketValue: Number(h.qty || 0) * Number(h.marketPrice || 0),
        investedValue: Number(h.qty || 0) * Number(h.avgPrice || 0)
      }))
    );

    res.json({
      userId: req.params.userId,
      brokerPortfolios,
      holdings,
      totals: {
        currentValue: holdings.reduce((s, h) => s + h.marketValue, 0),
        investedValue: holdings.reduce((s, h) => s + h.investedValue, 0),
        unrealizedPnl: holdings.reduce((s, h) => s + (h.marketValue - h.investedValue), 0)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

brokerMirrorRouter.get("/funds/:userId", async (req, res) => {
  try {
    const brokerFunds = await collectFromBrokers(req.params.userId, "getFunds");

    res.json({
      userId: req.params.userId,
      brokerFunds,
      totals: {
        ledgerBalance: brokerFunds.reduce((s, f) => s + Number(f.ledgerBalance || 0), 0),
        availableCash: brokerFunds.reduce((s, f) => s + Number(f.availableCash || 0), 0),
        pendingPayments: brokerFunds.reduce((s, f) => s + Number(f.pendingPayments || 0), 0),
        pendingBuyOrders: brokerFunds.reduce((s, f) => s + Number(f.pendingBuyOrders || 0), 0)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

brokerMirrorRouter.get("/orders/:userId", async (req, res) => {
  try {
    const brokerOrders = await collectFromBrokers(req.params.userId, "getOrders");
    const orders = brokerOrders.flatMap(o => o.orders);

    res.json({
      userId: req.params.userId,
      brokerOrders,
      orders: orders.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

brokerMirrorRouter.post("/orders/place", async (req, res) => {
  try {
    const { userId = "u1", brokerId = "aib", order } = req.body || {};
    if (!order) return res.status(400).json({ error: "Order is required." });

    const account = defaultLinkedAccounts(userId).find(a => a.brokerId === brokerId) || defaultLinkedAccounts(userId)[0];
    const adapter = getBrokerAdapter(account.brokerId);
    const brokerOrder = await adapter.placeOrder(account, order);

    res.status(201).json({
      message: "Order sent to broker mirror.",
      brokerOrder
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

brokerMirrorRouter.post("/orders/cancel", async (req, res) => {
  try {
    const { userId = "u1", brokerId = "aib", orderId } = req.body || {};
    const account = defaultLinkedAccounts(userId).find(a => a.brokerId === brokerId) || defaultLinkedAccounts(userId)[0];
    const adapter = getBrokerAdapter(account.brokerId);
    const result = await adapter.cancelOrder(account, orderId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
