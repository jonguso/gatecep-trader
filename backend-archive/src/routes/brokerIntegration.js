import { supportedBrokers } from "../brokers/brokerDirectory.js";
import { linkBrokerAccount, routeOrderToBroker, getBrokerLinks } from "../services/brokerOrderRouter.js";

export function listBrokers(req, res) {
  const userId = req.query.userId;
  const links = userId ? getBrokerLinks(userId) : [];

  res.json({
    brokers: supportedBrokers.map(b => ({
      ...b,
      linked: links.some(x => x.brokerId === b.id && x.status === "LINKED")
    }))
  });
}

export async function linkBroker(req, res) {
  try {
    const { userId = "u1", brokerId, brokerAccountId, cdsAccount } = req.body;
    const link = await linkBrokerAccount({ userId, brokerId, brokerAccountId, cdsAccount });
    res.json(link);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function routeBrokerOrder(req, res) {
  try {
    const order = await routeOrderToBroker({
      userId: req.body.userId || "u1",
      brokerId: req.body.brokerId || "mock-broker",
      symbol: String(req.body.symbol).toUpperCase(),
      side: String(req.body.side).toUpperCase(),
      price: Number(req.body.price),
      qty: Number(req.body.qty),
      orderType: req.body.orderType || "LIMIT",
      validity: req.body.validity || "DAY"
    });

    res.json({ message: "Order routed to broker", order });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      priceBand: err.priceBand
    });
  }
}
