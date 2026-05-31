const summaries = {};

export function saveBrokerAccountSummary(broker, summary = {}) {
  const key = String(broker || "AIB").toUpperCase();

  summaries[key] = {
    broker: key,
    portfolioValue: Number(summary.portfolioValue || 0),
    ledgerBalance: Number(summary.ledgerBalance || 0),
    unsettledPurchaseValue: Number(summary.unsettledPurchaseValue || 0),
    unsettledSaleValue: Number(summary.unsettledSaleValue || 0),
    updatedAt: new Date().toISOString()
  };

  return summaries[key];
}

export function getBrokerAccountSummary(broker) {
  const key = String(broker || "AIB").toUpperCase();

  return (
    summaries[key] || {
      broker: key,
      portfolioValue: 0,
      ledgerBalance: 0,
      unsettledPurchaseValue: 0,
      unsettledSaleValue: 0,
      updatedAt: null
    }
  );
}