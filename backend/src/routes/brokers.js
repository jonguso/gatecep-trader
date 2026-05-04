import { v4 as uuidv4 } from "uuid";
import { BROKERS, getBroker } from "../data/brokers.js";
import { state, getUser, audit } from "../store/state.js";

export function getBrokers(req, res) {
  res.json(BROKERS);
}

export function getMyBrokerLinks(req, res) {
  const userId = req.query.userId;
  res.json(state.brokerLinks.filter(l => l.userId === userId));
}

export function linkBroker(req, res) {
  const { userId, brokerId, brokerCustomerId, cdsAccount } = req.body;
  const user = getUser(userId);
  const broker = getBroker(brokerId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!broker) return res.status(404).json({ error: "Broker not found" });

  const link = {
    id: uuidv4(),
    userId,
    brokerId,
    brokerCustomerId: brokerCustomerId || null,
    cdsAccount: cdsAccount || null,
    status: broker.id === "mock-broker" ? "VERIFIED" : "PENDING_VERIFICATION",
    createdAt: new Date().toISOString()
  };

  state.brokerLinks.unshift(link);
  user.selectedBrokerId = brokerId;
  user.brokerCustomerId = brokerCustomerId || user.brokerCustomerId;
  user.cdsAccount = cdsAccount || user.cdsAccount;

  audit("BROKER_LINK_REQUESTED", `Linked broker ${broker.name}`, userId, link);
  res.json(link);
}

export function selectBroker(req, res) {
  const { userId, brokerId } = req.body;
  const user = getUser(userId);
  const broker = getBroker(brokerId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!broker) return res.status(404).json({ error: "Broker not found" });
  user.selectedBrokerId = brokerId;
  audit("BROKER_SELECTED", `Selected broker ${broker.name}`, userId);
  res.json({ user: { ...user, password: undefined }, broker });
}
