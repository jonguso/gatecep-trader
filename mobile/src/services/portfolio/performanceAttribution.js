const DIVIDEND_YIELDS = {
  BAT: 7.8,
  EABL: 5.2,
  SCOM: 4.7,
  KCB: 6.4,
  COOP: 5.8,
  ABSA: 6.2,
  SCBK: 6.9,
  DTK: 5.1,
  KNRE: 4.6,
  SMWF: 3.5,
  GLD: 0,
  KQ: 0
};

export function buildPerformanceAttribution(portfolio = [], transactions = []) {
  const holdings = Array.isArray(portfolio) ? portfolio : [];
  const txs = Array.isArray(transactions) ? transactions : [];

  const bestPerformer = pickBestPerformer(holdings);
  const worstPerformer = pickWorstPerformer(holdings);
  const largestPosition = pickLargestPosition(holdings);
  const mostAccumulated = pickMostAccumulated(txs);
  const mostTraded = pickMostTraded(txs);
  const estimatedDividendIncome = estimateDividendIncome(holdings);
  const sectorBreakdown = buildSectorBreakdown(holdings);

  return {
    bestPerformer,
    worstPerformer,
    largestPosition,
    mostAccumulated,
    mostTraded,
    estimatedDividendIncome,
    sectorBreakdown
  };
}

function pickBestPerformer(holdings = []) {
  const rows = holdings
    .filter((h) => Number.isFinite(Number(h.profitLossPct)))
    .sort((a, b) => Number(b.profitLossPct || 0) - Number(a.profitLossPct || 0));

  return rows[0] || null;
}

function pickWorstPerformer(holdings = []) {
  const rows = holdings
    .filter((h) => Number.isFinite(Number(h.profitLossPct)))
    .sort((a, b) => Number(a.profitLossPct || 0) - Number(b.profitLossPct || 0));

  return rows[0] || null;
}

function pickLargestPosition(holdings = []) {
  const rows = [...holdings].sort(
    (a, b) =>
      Number(b.marketValue || b.value || 0) -
      Number(a.marketValue || a.value || 0)
  );

  return rows[0] || null;
}

function pickMostAccumulated(transactions = []) {
  const buys = {};

  transactions.forEach((tx) => {
    const side = String(tx.side || "").toUpperCase();
    const symbol = String(tx.symbol || "").toUpperCase();

    if (side !== "BUY" || !symbol) return;

    buys[symbol] = {
      symbol,
      buys: (buys[symbol]?.buys || 0) + 1,
      quantity:
        Number(buys[symbol]?.quantity || 0) + Number(tx.quantity || 0),
      value: Number(buys[symbol]?.value || 0) + Number(tx.value || 0)
    };
  });

  return Object.values(buys).sort((a, b) => b.buys - a.buys)[0] || null;
}

function pickMostTraded(transactions = []) {
  const counts = {};

  transactions.forEach((tx) => {
    const symbol = String(tx.symbol || "").toUpperCase();

    if (!symbol) return;

    counts[symbol] = {
      symbol,
      trades: (counts[symbol]?.trades || 0) + 1,
      value: Number(counts[symbol]?.value || 0) + Number(tx.value || 0)
    };
  });

  return Object.values(counts).sort((a, b) => b.trades - a.trades)[0] || null;
}

function estimateDividendIncome(holdings = []) {
  return holdings.reduce((sum, h) => {
    const symbol = String(h.symbol || "").toUpperCase();
    const value = Number(h.marketValue || h.value || 0);
    const dividendYield = Number(DIVIDEND_YIELDS[symbol] || 0);

    return sum + value * (dividendYield / 100);
  }, 0);
}

function buildSectorBreakdown(holdings = []) {
  const grouped = {};

  holdings.forEach((h) => {
    const sector = h.sector || "Unknown";
    const value = Number(h.marketValue || h.value || 0);
    const profitLoss = Number(h.profitLoss || 0);

    if (!grouped[sector]) {
      grouped[sector] = {
        sector,
        value: 0,
        profitLoss: 0,
        count: 0
      };
    }

    grouped[sector].value += value;
    grouped[sector].profitLoss += profitLoss;
    grouped[sector].count += 1;
  });

  return Object.values(grouped).sort((a, b) => b.value - a.value);
}