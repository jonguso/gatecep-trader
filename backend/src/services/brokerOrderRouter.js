import { v4 as uuidv4 } from "uuid";
import { state, audit } from "../store/state.js";
import { brokerAdapter } from "../brokers/brokerFactory.js";
import { marketDataProvider } from "../market-data/marketDataFactory.js";
import { validateLimitPrice } from "./trading/priceBands.js";

export function getBrokerLinks(userId) {
  if (!state.brokerLinks) state.brokerLinks = {};
  return state.brokerLinks[userId] || [];
}

export function saveBrokerLink(userId, link) {
  if (!state.brokerLinks) state.brokerLinks = {};
  if (!state.brokerLinks[userId]) state.brokerLinks[userId] = [];

  const existing = state.brokerLinks[userId].findIndex(x => x.brokerId === link.brokerId);
  if (existing >= 0) state.brokerLinks[userId][existing] = link;
  else state.brokerLinks[userId].push(link);

  return link;
}

export function getActiveBrokerLink(userId, brokerId) {
  const links = getBrokerLinks(userId);
  return links.find(x => x.brokerId === brokerId && x.status === "LINKED");
}

export async function linkBrokerAccount({ userId, brokerId, brokerAccountId, cdsAccount }) {
  const validation = await brokerAdapter.validateAccountLink({ userId, brokerAccountId, cdsAccount });

  const link = saveBrokerLink(userId, {
    userId,
    brokerId,
    brokerAccountId: validation.brokerAccountId || brokerAccountId,
    cdsAccount,
    status: validation.linked ? "LINKED" : "PENDING",
    linkedAt: new Date().toISOString(),
    validation
  });

  audit("BROKER_LINK_UPDATED", `Broker link ${brokerId}`, userId, { brokerId, brokerAccountId });
  return link;
}

export async function routeOrderToBroker({ userId, brokerId = "mock-broker", symbol, side, price, qty, orderType = "LIMIT", validity = "DAY" }) {
  const requireLink = String(process.env.REQUIRE_BROKER_LINK || "true") === "true";

  if (requireLink && brokerId !== "mock-broker") {
    const link = getActiveBrokerLink(userId, brokerId);
    if (!link) {
      const err = new Error("Broker account is not linked");
      err.statusCode = 403;
      throw err;
    }
  }

  const quote = await marketDataProvider.getSecurity(symbol);
  const referencePrice = Number(quote?.offerPrice || quote?.price || price);
  const validation = validateLimitPrice({ side, price, referencePrice });

  if (!validation.ok) {
    const err = new Error(validation.error);
    err.statusCode = 400;
    err.priceBand = validation.band;
    throw err;
  }

  const order = {
    id: uuidv4(),
    userId,
    brokerId,
    brokerAccountId: getActiveBrokerLink(userId, brokerId)?.brokerAccountId || "DEMO-CDS-001",
    symbol,
    side,
    price: Number(price),
    qty: Number(qty),
    orderType,
    validity,
    status: "ROUTING",
    submittedAt: new Date().toISOString(),
    priceBand: validation.band
  };

  const brokerResponse = await brokerAdapter.routeOrder(order);

  const routed = {
    ...order,
    status: brokerResponse.status || (brokerResponse.accepted ? "ACCEPTED" : "REJECTED"),
    brokerOrderId: brokerResponse.brokerOrderId,
    brokerResponse
  };

  if (!state.orderLog) state.orderLog = [];
  state.orderLog.unshift(routed);

  audit("BROKER_ORDER_ROUTED", `Order routed to ${brokerId}`, userId, {
    orderId: order.id,
    brokerOrderId: routed.brokerOrderId,
    symbol,
    side,
    qty,
    price
  });

  return routed;
}
