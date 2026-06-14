import { loadPortfolio } from "../portfolio/portfolioStore";
import { loadBrokerAccounts } from "../brokers/brokerAccountStore";
import { syncBrokerPortfolio } from "../brokers/brokerPortfolioSync";

export async function runPositionReconciliation() {
  const localPortfolio = await loadPortfolio({ revalue: false });
  const brokerAccounts = await loadBrokerAccounts();

  const brokerHoldings = [];

  for (const account of brokerAccounts) {
    try {
      const result = await syncBrokerPortfolio(account);

      brokerHoldings.push(
        ...(result?.holdings || []).map((holding) => ({
          ...holding,
          brokerAccountId: account.id,
          brokerName: account.brokerName
        }))
      );
    } catch (error) {
      console.log("Reconciliation sync error:", error.message);
    }
  }

  const localMap = buildHoldingMap(localPortfolio);
  const brokerMap = buildHoldingMap(brokerHoldings);

  const mismatches = [];
  const symbols = new Set([
    ...Object.keys(localMap),
    ...Object.keys(brokerMap)
  ]);

  symbols.forEach((symbol) => {
    const localQty = Number(localMap[symbol]?.quantity || 0);
    const brokerQty = Number(brokerMap[symbol]?.quantity || 0);

    if (localQty !== brokerQty) {
      mismatches.push({
        symbol,
        localQuantity: localQty,
        brokerQuantity: brokerQty,
        difference: brokerQty - localQty,
        status: "MISMATCH"
      });
    }
  });

  const healthScore =
    symbols.size === 0
      ? 100
      : Math.max(
          0,
          Math.round(
            ((symbols.size - mismatches.length) / symbols.size) * 100
          )
        );

  return {
    ok: true,
    totalSymbols: symbols.size,
    matchedSymbols: symbols.size - mismatches.length,
    mismatches,
    mismatchCount: mismatches.length,
    healthScore,
    status:
      mismatches.length === 0
        ? "HEALTHY"
        : mismatches.length <= 3
        ? "WARNING"
        : "CRITICAL",
    checkedAt: new Date().toISOString()
  };
}

function buildHoldingMap(rows = []) {
  const map = {};

  rows.forEach((row) => {
    const symbol = String(row.symbol || "").toUpperCase();

    if (!symbol) return;

    map[symbol] = {
      symbol,
      quantity:
        Number(map[symbol]?.quantity || 0) +
        Number(row.quantity || 0)
    };
  });

  return map;
}