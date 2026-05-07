import express from "express";
import { BROKERS, findBroker } from "../data/brokers.js";

export const brokerRouter = express.Router();

const userBrokerAccounts = new Map();

function getUserAccounts(userId) {
  return userBrokerAccounts.get(userId) || [];
}

brokerRouter.get("/", (req, res) => {
  res.json({ count: BROKERS.length, data: BROKERS });
});

brokerRouter.get("/user/:userId", (req, res) => {
  res.json({ userId: req.params.userId, data: getUserAccounts(req.params.userId) });
});

brokerRouter.post("/user/:userId/link", (req, res) => {
  const { brokerId, accountNumber } = req.body || {};
  const broker = findBroker(brokerId);

  if (!broker) return res.status(404).json({ error: "Broker not found." });
  if (!accountNumber) return res.status(400).json({ error: "Broker account number is required." });

  const rows = getUserAccounts(req.params.userId);
  const linked = {
    id: `${req.params.userId}-${brokerId}`,
    userId: req.params.userId,
    brokerId,
    brokerName: broker.name,
    brokerShortName: broker.shortName,
    accountNumber,
    status: "LINKED",
    linkedAt: new Date().toISOString()
  };

  userBrokerAccounts.set(req.params.userId, [...rows.filter(x => x.brokerId !== brokerId), linked]);
  res.status(201).json(linked);
});

brokerRouter.post("/recommend", (req, res) => {
  const { userId = "u1" } = req.body || {};
  const linked = getUserAccounts(userId);
  const brokerId = linked[0]?.brokerId || "aib";

  res.json({
    brokerId,
    confidence: linked.length ? 82 : 68,
    reason: linked.length
      ? "Recommended because this broker account is linked."
      : "Recommended as first available broker example. Link broker for live routing."
  });
});

brokerRouter.post("/route-order", (req, res) => {
  const { brokerId, order } = req.body || {};
  const broker = findBroker(brokerId);

  if (!broker) return res.status(404).json({ error: "Broker not found." });
  if (!order) return res.status(400).json({ error: "Order is required." });

  res.json({
    brokerId,
    brokerName: broker.name,
    brokerOrderId: `GTC-${brokerId.toUpperCase()}-${Date.now()}`,
    status: "PENDING_BROKER_CONFIRMATION",
    message: "Broker selected. Direct API routing requires broker integration agreement."
  });
});
