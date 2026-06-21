import express from "express";

export const brokerRouter = express.Router();

export const BROKER_ROUTING_TABLE = [
  {
    brokerId: "aib",
    brokerName: "AIB-AXYS Africa",
    shortName: "AIB",
    status: "MOCK_READY",
    supportsSignup: true,
    supportsAccountLinking: true,
    supportsPortfolioMirror: true,
    supportsFundsMirror: true,
    supportsOrderRouting: true,
    apiMode: "MOCK_ADAPTER",
    signupUrl: "https://www.aib-axysafrica.com/"
  },
  {
    brokerId: "abc",
    brokerName: "ABC Capital",
    shortName: "ABC",
    status: "MOCK_READY",
    supportsSignup: true,
    supportsAccountLinking: true,
    supportsPortfolioMirror: true,
    supportsFundsMirror: true,
    supportsOrderRouting: true,
    apiMode: "MOCK_ADAPTER",
    signupUrl: "https://www.abccapital.co.ke/"
  },
  {
    brokerId: "ncba",
    brokerName: "NCBA Investment Bank",
    shortName: "NCBA",
    status: "PLANNED",
    supportsSignup: false,
    supportsAccountLinking: true,
    supportsPortfolioMirror: false,
    supportsFundsMirror: false,
    supportsOrderRouting: false,
    apiMode: "PENDING_INTEGRATION",
    signupUrl: ""
  },
  {
    brokerId: "dyer",
    brokerName: "Dyer & Blair Investment Bank",
    shortName: "Dyer",
    status: "PLANNED",
    supportsSignup: false,
    supportsAccountLinking: true,
    supportsPortfolioMirror: false,
    supportsFundsMirror: false,
    supportsOrderRouting: false,
    apiMode: "PENDING_INTEGRATION",
    signupUrl: ""
  }
];

const userBrokerAccounts = new Map();

function defaultAccounts(userId) {
  return [
    {
      id: `${userId}-aib`,
      userId,
      brokerId: "aib",
      brokerName: "AIB-AXYS Africa",
      brokerShortName: "AIB",
      accountNumber: "AIB-DEMO-001",
      status: "LINKED",
      linkedAt: new Date().toISOString()
    },
    {
      id: `${userId}-abc`,
      userId,
      brokerId: "abc",
      brokerName: "ABC Capital",
      brokerShortName: "ABC",
      accountNumber: "ABC-DEMO-001",
      status: "LINKED",
      linkedAt: new Date().toISOString()
    }
  ];
}

function getUserAccounts(userId) {
  const existing = userBrokerAccounts.get(userId);
  if (existing && existing.length) return existing;
  const seeded = defaultAccounts(userId);
  userBrokerAccounts.set(userId, seeded);
  return seeded;
}

function findBroker(brokerId) {
  return BROKER_ROUTING_TABLE.find(b => b.brokerId === brokerId || b.id === brokerId);
}

brokerRouter.get("/", (req, res) => {
  res.json({
    count: BROKER_ROUTING_TABLE.length,
    data: BROKER_ROUTING_TABLE.map(b => ({
      id: b.brokerId,
      ...b,
      name: b.brokerName,
      market: "NSE",
      supportsApiRouting: b.supportsOrderRouting
    }))
  });
});

brokerRouter.get("/routing-table", (req, res) => {
  res.json({ count: BROKER_ROUTING_TABLE.length, data: BROKER_ROUTING_TABLE });
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
    id: `${req.params.userId}-${broker.brokerId}`,
    userId: req.params.userId,
    brokerId: broker.brokerId,
    brokerName: broker.brokerName,
    brokerShortName: broker.shortName,
    accountNumber,
    status: "LINKED",
    linkedAt: new Date().toISOString()
  };

  userBrokerAccounts.set(req.params.userId, [...rows.filter(x => x.brokerId !== broker.brokerId), linked]);
  res.status(201).json(linked);
});

brokerRouter.post("/recommend", (req, res) => {
  const { userId = "u1", symbol, side, orderValue = 0, selectedBrokerId } = req.body || {};
  const linked = getUserAccounts(userId);
  const selected = linked.find(x => x.brokerId === selectedBrokerId);
  const readyLinked = linked.filter(x => findBroker(x.brokerId)?.supportsOrderRouting);
  const recommendedAccount = selected || readyLinked[0] || linked[0];
  const broker = findBroker(recommendedAccount?.brokerId || "aib");

  let confidence = 72;
  const reasons = [];

  if (selected) {
    confidence += 10;
    reasons.push("You selected a linked broker account.");
  }

  if (broker?.supportsPortfolioMirror) {
    confidence += 4;
    reasons.push("Portfolio mirror is enabled for this broker.");
  }

  if (broker?.supportsFundsMirror) {
    confidence += 4;
    reasons.push("Funds mirror is enabled for this broker.");
  }

  if (broker?.supportsOrderRouting) {
    confidence += 5;
    reasons.push("Broker mirror order routing is enabled.");
  }

  if (Number(orderValue) > 100000) {
    confidence -= 4;
    reasons.push("Order value is high; confirm liquidity before routing.");
  }

  res.json({
    brokerId: broker?.brokerId || "aib",
    brokerName: broker?.brokerName || "AIB-AXYS Africa",
    brokerShortName: broker?.shortName || "AIB",
    accountNumber: recommendedAccount?.accountNumber || "AIB-DEMO-001",
    confidence: Math.max(50, Math.min(95, confidence)),
    recommendation: `${broker?.shortName || "AIB"} is recommended for this ${side || "trade"} order on ${symbol || "NSE security"}.`,
    reasons,
    routingStatus: broker?.status || "MOCK_READY",
    apiMode: broker?.apiMode || "MOCK_ADAPTER"
  });
});

brokerRouter.post("/route-order", (req, res) => {
  const { brokerId, order } = req.body || {};
  const broker = findBroker(brokerId);

  if (!broker) return res.status(404).json({ error: "Broker not found." });
  if (!order) return res.status(400).json({ error: "Order is required." });

  res.json({
    brokerId: broker.brokerId,
    brokerName: broker.brokerName,
    brokerOrderId: `GTC-${broker.shortName}-${Date.now()}`,
    status: broker.supportsOrderRouting ? "PENDING_BROKER_CONFIRMATION" : "PENDING_INTEGRATION",
    message: broker.supportsOrderRouting
      ? "Order routed to broker mirror adapter."
      : "Broker integration is planned but not enabled yet."
  });
});
