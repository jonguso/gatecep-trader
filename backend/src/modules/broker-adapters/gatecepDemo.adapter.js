import {
  getUserPortfolio,
  createHolding,
  settleUserPosition
} from "../portfolio/portfolio.service.js";
import { recordTransaction } from "../transactions/transaction.service.js";
import {
  getCashSummary,
  saveCashBalance
} from "../cash/cash.service.js";

export const GATECEP_DEMO_BROKER_ID = "GATECEP-DEMO";

function round4(value) {
  return Number(Number(value || 0).toFixed(4));
}

function round2(value) {
  return Number(Number(value || 0).toFixed(2));
}

function findPosition(portfolio, symbol) {
  return (portfolio?.holdings || []).find(
    (h) => String(h.symbol || "").toUpperCase() === symbol
  );
}

async function getBrokerCash(userId) {
  const cashSummary = await getCashSummary(userId);

  const brokerCash = (cashSummary?.balances || []).find(
    (item) =>
      String(item.broker || "").toUpperCase() === GATECEP_DEMO_BROKER_ID
  );

  return Number(brokerCash?.cashBalance || 0);
}

export async function getPortfolio(userId) {
  return await getUserPortfolio(userId, {
    broker: GATECEP_DEMO_BROKER_ID
  });
}

export async function getCashBalance(userId) {
  const cash = await getBrokerCash(userId);

  return {
    ok: true,
    broker: GATECEP_DEMO_BROKER_ID,
    cash,
    currency: "KES",
    syncedAt: new Date().toISOString()
  };
}

export async function placeOrder(userId, order = {}) {
  const symbol = String(order.symbol || "").trim().toUpperCase();
  const side = String(order.side || "BUY").toUpperCase();
  const quantity = Number(order.quantity || 0);
  const price = Number(order.price || order.marketPrice || 0);
  const fees = Number(order.fees || 0);
  const tax = Number(order.tax || 0);

  if (!symbol || quantity <= 0 || price <= 0) {
    throw new Error("Invalid demo order");
  }

  if (side === "BUY") {
    return await placeBuyOrder(userId, {
      ...order,
      symbol,
      side,
      quantity,
      price,
      fees,
      tax
    });
  }

  if (side === "SELL") {
    return await placeSellOrder(userId, {
      ...order,
      symbol,
      side,
      quantity,
      price,
      fees,
      tax
    });
  }

  return {
    ok: false,
    broker: GATECEP_DEMO_BROKER_ID,
    status: "REJECTED",
    side,
    symbol,
    message: `Unsupported demo order side: ${side}`
  };
}

async function placeBuyOrder(userId, order) {
  const { symbol, side, quantity, price, fees, tax } = order;

  const currentPortfolio = await getUserPortfolio(userId, {
    broker: GATECEP_DEMO_BROKER_ID
  });

  const existing = findPosition(currentPortfolio, symbol);

  const existingQty = Number(existing?.quantity || 0);
  const existingAvg = Number(
    existing?.averagePrice || existing?.averageCost || 0
  );
  const existingSettledQty = Number(
    existing?.settledQuantity ?? existing?.quantity ?? 0
  );
  const existingPendingBuyQty = Number(existing?.pendingBuyQuantity || 0);
  const existingPendingSellQty = Number(existing?.pendingSellQuantity || 0);

  const buyCost = quantity * price;
  const requiredCash = buyCost + fees + tax;
  const availableCash = await getBrokerCash(userId);

  if (availableCash < requiredCash) {
    return {
      ok: false,
      broker: GATECEP_DEMO_BROKER_ID,
      status: "REJECTED",
      side,
      symbol,
      quantity,
      price,
      requiredCash: round2(requiredCash),
      availableCash: round2(availableCash),
      shortfall: round2(requiredCash - availableCash),
      message:
        "You do not have enough deposit / available trading space to execute this transaction."
    };
  }

  const existingCost = existingQty * existingAvg;
  const nextQty = existingQty + quantity;
  const nextAvg = nextQty > 0 ? (existingCost + buyCost) / nextQty : price;
  const nextMarketValue = nextQty * price;
  const nextProfitLoss = nextMarketValue - nextQty * nextAvg;
  const nextPendingBuyQty = existingPendingBuyQty + quantity;
  const nextCashBalance = availableCash - requiredCash;

  const holding = await createHolding(userId, {
    broker: GATECEP_DEMO_BROKER_ID,
    symbol,
    name: order.name || existing?.name || symbol,
    sector: order.sector || existing?.sector || "Unknown",
    quantity: round4(nextQty),
    settledQuantity: round4(existingSettledQty),
    pendingBuyQuantity: round4(nextPendingBuyQty),
    pendingSellQuantity: round4(existingPendingSellQty),
    settlementStatus: "PENDING_BUY_SETTLEMENT",
    settlementDate: order.settlementDate || null,
    averagePrice: round4(nextAvg),
    averageCost: round4(nextAvg),
    marketPrice: round4(price),
    price: round4(price),
    marketValue: round4(nextMarketValue),
    value: round4(nextMarketValue),
    profitLoss: round4(nextProfitLoss),
    source: "DEMO_TRADE"
  });

  const brokerOrderId = `GDEMO-${Date.now()}-${symbol}`;

  const transaction = await recordTransaction(userId, {
    broker: GATECEP_DEMO_BROKER_ID,
    transactionType: "BUY",
    symbol,
    quantity,
    price,
    grossAmount: buyCost,
    fees,
    tax,
    reference: brokerOrderId,
    description: `Demo BUY ${quantity} ${symbol} @ ${price}`,
    metadata: {
      source: "GATECEP_DEMO_BROKER",
      previousQuantity: existingQty,
      newQuantity: nextQty,
      averagePrice: round4(nextAvg),
      settledQuantity: existingSettledQty,
      pendingBuyQuantity: nextPendingBuyQty,
      settlementStatus: "PENDING_BUY_SETTLEMENT"
    }
  });

  const cashBalance = await saveCashBalance(userId, {
    broker: GATECEP_DEMO_BROKER_ID,
    currency: "KES",
    cashBalance: round2(nextCashBalance),
    source: "DEMO_BUY_DEBIT"
  });

  return {
    ok: true,
    broker: GATECEP_DEMO_BROKER_ID,
    brokerOrderId,
    transaction,
    status: "FILLED",
    side,
    symbol,
    previousQuantity: existingQty,
    quantity,
    newQuantity: nextQty,
    price,
    averagePrice: round4(nextAvg),
    marketValue: round4(nextMarketValue),
    holding,
    requiredCash: round2(requiredCash),
    cashDebited: round2(requiredCash),
    cashBalance,
    availableCashAfter: round2(nextCashBalance),
    message: "Gatecep Demo Broker filled and accumulated the order.",
    filledAt: new Date().toISOString()
  };
}

async function placeSellOrder(userId, order) {
  const { symbol, side, quantity, price, fees, tax } = order;

  const currentPortfolio = await getUserPortfolio(userId, {
    broker: GATECEP_DEMO_BROKER_ID
  });

  const existing = findPosition(currentPortfolio, symbol);

  const existingQty = Number(existing?.quantity || 0);
  const settledQty = Number(existing?.settledQuantity || 0);
  const existingAvg = Number(
    existing?.averagePrice || existing?.averageCost || 0
  );

  if (!existing || settledQty <= 0 || quantity > settledQty) {
    return {
      ok: false,
      broker: GATECEP_DEMO_BROKER_ID,
      status: "REJECTED",
      side,
      symbol,
      requestedQuantity: quantity,
      availableSellQuantity: settledQty,
      valuationQuantity: existingQty,
      message:
        "You cannot sell unsettled shares. Available sell quantity is based on settled holdings only."
    };
  }

  const grossAmount = quantity * price;
  const netCredit = grossAmount - fees - tax;

  const nextQty = existingQty - quantity;
  const nextSettledQty = settledQty - quantity;
  const nextPendingSellQty =
    Number(existing?.pendingSellQuantity || 0) + quantity;
  const nextPendingBuyQty = Number(existing?.pendingBuyQuantity || 0);

  const nextMarketValue = nextQty * price;
  const nextProfitLoss = nextQty * (price - existingAvg);
  const brokerOrderId = `GDEMO-${Date.now()}-${symbol}`;

  const holding = await createHolding(userId, {
    broker: GATECEP_DEMO_BROKER_ID,
    symbol,
    name: order.name || existing?.name || symbol,
    sector: order.sector || existing?.sector || "Unknown",
    quantity: round4(nextQty),
    settledQuantity: round4(nextSettledQty),
    pendingBuyQuantity: round4(nextPendingBuyQty),
    pendingSellQuantity: round4(nextPendingSellQty),
    settlementStatus: "PENDING_SELL_SETTLEMENT",
    settlementDate: order.settlementDate || null,
    averagePrice: round4(existingAvg),
    averageCost: round4(existingAvg),
    marketPrice: round4(price),
    price: round4(price),
    marketValue: round4(nextMarketValue),
    value: round4(nextMarketValue),
    profitLoss: round4(nextProfitLoss),
    source: "DEMO_TRADE"
  });

  const transaction = await recordTransaction(userId, {
    broker: GATECEP_DEMO_BROKER_ID,
    transactionType: "SELL",
    symbol,
    quantity,
    price,
    grossAmount,
    fees,
    tax,
    reference: brokerOrderId,
    description: `Demo SELL ${quantity} ${symbol} @ ${price}`,
    metadata: {
      source: "GATECEP_DEMO_BROKER",
      previousQuantity: existingQty,
      newQuantity: nextQty,
      previousSettledQuantity: settledQty,
      newSettledQuantity: nextSettledQty,
      pendingSellQuantity: nextPendingSellQty,
      settlementStatus: "PENDING_SELL_SETTLEMENT"
    }
  });

  const availableCash = await getBrokerCash(userId);
  const nextCashBalance = availableCash + netCredit;

  const cashBalance = await saveCashBalance(userId, {
    broker: GATECEP_DEMO_BROKER_ID,
    currency: "KES",
    cashBalance: round2(nextCashBalance),
    source: "DEMO_SELL_CREDIT"
  });

  return {
    ok: true,
    broker: GATECEP_DEMO_BROKER_ID,
    brokerOrderId,
    transaction,
    status: "FILLED",
    side,
    symbol,
    previousQuantity: existingQty,
    quantity,
    newQuantity: nextQty,
    previousSettledQuantity: settledQty,
    newSettledQuantity: nextSettledQty,
    price,
    grossAmount: round2(grossAmount),
    cashCredited: round2(netCredit),
    availableCashAfter: round2(nextCashBalance),
    holding,
    cashBalance,
    message: "Gatecep Demo Broker sold settled shares and credited cash.",
    filledAt: new Date().toISOString()
  };
}

export async function settlePortfolio(userId) {
  const portfolio = await getPortfolio(userId);

  const settled = [];

  for (const holding of portfolio.holdings || []) {
    const pendingBuy = Number(holding.pendingBuyQuantity || 0);
    const pendingSell = Number(holding.pendingSellQuantity || 0);
    const settledQty = Number(holding.settledQuantity || 0);

    const nextSettled =
      settledQty + pendingBuy;

    await settleUserPosition(userId, {
  broker: GATECEP_DEMO_BROKER_ID,
  symbol: holding.symbol,
  settledQuantity: nextSettled,
  pendingBuyQuantity: 0,
  pendingSellQuantity: 0,
  settlementStatus: "SETTLED",
  settlementDate: new Date().toISOString()
});

    settled.push({
      symbol: holding.symbol,
      settledBefore: settledQty,
      settledAfter: nextSettled,
      clearedPendingBuy: pendingBuy,
      clearedPendingSell: pendingSell
    });
  }

  return {
    ok: true,
    broker: GATECEP_DEMO_BROKER_ID,
    settled,
    settledAt: new Date().toISOString()
  };
}

export async function getOrders(userId) {
  return {
    ok: true,
    broker: GATECEP_DEMO_BROKER_ID,
    orders: [],
    syncedAt: new Date().toISOString()
  };
}

export async function sync(userId) {
  const portfolio = await getPortfolio(userId);
  const cash = await getCashBalance(userId);

  return {
    ok: true,
    broker: GATECEP_DEMO_BROKER_ID,
    portfolio,
    cash,
    syncedAt: new Date().toISOString()
  };
}