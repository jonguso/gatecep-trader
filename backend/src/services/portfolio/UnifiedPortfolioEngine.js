import { getBrokerAdapter } from "../../brokerAdapters/BrokerAdapterFactory.js";

function round2(value) {
  return Number(Number(value || 0).toFixed(2));
}

function defaultLinkedAccounts(userId) {
  return [
    { userId, brokerId: "aib", brokerName: "AIB-AXYS Africa", accountNumber: "AIB-DEMO-001", status: "LINKED" },
    { userId, brokerId: "abc", brokerName: "ABC Capital", accountNumber: "ABC-DEMO-001", status: "LINKED" }
  ];
}

function pct(value, total) {
  if (!total) return 0;
  return round2((Number(value || 0) / Number(total || 1)) * 100);
}

function riskLevel(score) {
  if (score >= 75) return "HIGH";
  if (score >= 45) return "MEDIUM";
  return "LOW";
}

export async function buildUnifiedPortfolio(userId = "u1") {
  const accounts = defaultLinkedAccounts(userId);

  const brokerPortfolioPayloads = [];
  const brokerFundsPayloads = [];
  const brokerOrdersPayloads = [];

  for (const account of accounts) {
    const adapter = getBrokerAdapter(account.brokerId);
    brokerPortfolioPayloads.push(await adapter.getPortfolio(account));
    brokerFundsPayloads.push(await adapter.getFunds(account));
    brokerOrdersPayloads.push(await adapter.getOrders(account));
  }

  const brokerHoldings = brokerPortfolioPayloads.flatMap(portfolio =>
    portfolio.holdings.map(h => {
      const qty = Number(h.qty || 0);
      const avgPrice = Number(h.avgPrice || 0);
      const marketPrice = Number(h.marketPrice || 0);

      return {
        ...h,
        brokerId: portfolio.brokerId,
        brokerName: portfolio.brokerName,
        accountNumber: portfolio.accountNumber,
        qty,
        avgPrice,
        marketPrice,
        investedValue: round2(qty * avgPrice),
        marketValue: round2(qty * marketPrice),
        unrealizedPnl: round2((qty * marketPrice) - (qty * avgPrice))
      };
    })
  );

  const bySymbolMap = new Map();

  for (const h of brokerHoldings) {
    const existing = bySymbolMap.get(h.symbol) || {
      symbol: h.symbol,
      name: h.name,
      sector: h.sector || "Other",
      totalQty: 0,
      investedValue: 0,
      marketValue: 0,
      brokerBreakdown: []
    };

    existing.totalQty += Number(h.qty || 0);
    existing.investedValue += Number(h.investedValue || 0);
    existing.marketValue += Number(h.marketValue || 0);
    existing.brokerBreakdown.push({
      brokerId: h.brokerId,
      brokerName: h.brokerName,
      accountNumber: h.accountNumber,
      qty: h.qty,
      avgPrice: h.avgPrice,
      marketPrice: h.marketPrice,
      marketValue: h.marketValue
    });

    bySymbolMap.set(h.symbol, existing);
  }

  const consolidatedHoldings = Array.from(bySymbolMap.values()).map(h => ({
    ...h,
    totalQty: round2(h.totalQty),
    investedValue: round2(h.investedValue),
    marketValue: round2(h.marketValue),
    avgCost: h.totalQty ? round2(h.investedValue / h.totalQty) : 0,
    marketPrice: h.totalQty ? round2(h.marketValue / h.totalQty) : 0,
    unrealizedPnl: round2(h.marketValue - h.investedValue)
  })).sort((a, b) => b.marketValue - a.marketValue);

  const totals = {
    investedValue: round2(consolidatedHoldings.reduce((s, h) => s + h.investedValue, 0)),
    currentValue: round2(consolidatedHoldings.reduce((s, h) => s + h.marketValue, 0)),
    unrealizedPnl: round2(consolidatedHoldings.reduce((s, h) => s + h.unrealizedPnl, 0)),
    ledgerBalance: round2(brokerFundsPayloads.reduce((s, f) => s + Number(f.ledgerBalance || 0), 0)),
    availableCash: round2(brokerFundsPayloads.reduce((s, f) => s + Number(f.availableCash || 0), 0)),
    pendingPayments: round2(brokerFundsPayloads.reduce((s, f) => s + Number(f.pendingPayments || 0), 0)),
    pendingBuyOrders: round2(brokerFundsPayloads.reduce((s, f) => s + Number(f.pendingBuyOrders || 0), 0))
  };

  totals.totalWealth = round2(totals.currentValue + totals.availableCash);

  const brokerExposure = brokerPortfolioPayloads.map(p => {
    const holdings = brokerHoldings.filter(h => h.brokerId === p.brokerId);
    const value = round2(holdings.reduce((s, h) => s + h.marketValue, 0));
    return {
      brokerId: p.brokerId,
      brokerName: p.brokerName,
      accountNumber: p.accountNumber,
      marketValue: value,
      allocationPct: pct(value, totals.currentValue),
      holdingsCount: holdings.length
    };
  }).sort((a,b)=>b.marketValue-a.marketValue);

  const sectorMap = new Map();
  for (const h of consolidatedHoldings) {
    const sector = h.sector || "Other";
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + h.marketValue);
  }

  const sectorExposure = Array.from(sectorMap.entries()).map(([sector, value]) => ({
    sector,
    marketValue: round2(value),
    allocationPct: pct(value, totals.currentValue)
  })).sort((a,b)=>b.marketValue-a.marketValue);

  const largestHolding = consolidatedHoldings[0];
  const largestSector = sectorExposure[0];
  const largestBroker = brokerExposure[0];

  let riskScore = 20;
  const coachInsights = [];

  if (largestHolding && pct(largestHolding.marketValue, totals.currentValue) > 35) {
    riskScore += 25;
    coachInsights.push(`${largestHolding.symbol} is more than 35% of portfolio value. Consider concentration risk.`);
  }

  if (largestSector && largestSector.allocationPct > 50) {
    riskScore += 25;
    coachInsights.push(`${largestSector.sector} sector exposure is ${largestSector.allocationPct}%. Portfolio is sector concentrated.`);
  }

  if (largestBroker && largestBroker.allocationPct > 70) {
    riskScore += 15;
    coachInsights.push(`${largestBroker.brokerName} holds ${largestBroker.allocationPct}% of assets. Consider broker diversification.`);
  }

  if (totals.availableCash < totals.currentValue * 0.05) {
    riskScore += 10;
    coachInsights.push("Available cash is below 5% of portfolio value. Liquidity buffer is low.");
  }

  if (coachInsights.length === 0) {
    coachInsights.push("Portfolio appears reasonably diversified across current mock broker data.");
  }

  const pendingOrders = brokerOrdersPayloads.flatMap(o => o.orders || []).filter(o =>
    ["PENDING", "PENDING_BROKER_CONFIRMATION", "OPEN"].includes(String(o.status).toUpperCase())
  );

  return {
    userId,
    generatedAt: new Date().toISOString(),
    source: "BROKER_MIRROR_ENGINE",
    accounts,
    totals,
    brokerFunds: brokerFundsPayloads,
    brokerHoldings,
    consolidatedHoldings,
    brokerExposure,
    sectorExposure,
    pendingOrders,
    coachG: {
      riskScore: Math.min(100, riskScore),
      riskLevel: riskLevel(riskScore),
      insights: coachInsights,
      summary: `Unified portfolio across ${accounts.length} linked brokers with ${consolidatedHoldings.length} consolidated securities.`
    }
  };
}
