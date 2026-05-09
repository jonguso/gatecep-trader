import {
  savePnlRecord,
  loadPnlLedger
} from "../../repositories/brokerAccounting.repository.js";

const pnlLedger = [];

(async () => {
  const saved = await loadPnlLedger();

  pnlLedger.push(...saved);
})();

export function recordRealizedTrade({
  symbol,
  quantity,
  averageCost,
  sellPrice,
  broker
}) {
  const realizedPnL =
    Number(
      (
        (sellPrice - averageCost) *
        quantity
      ).toFixed(2)
    );

  const record = {
    id: `PNL-${Date.now()}`,
    symbol,
    quantity,
    averageCost,
    sellPrice,
    broker,
    realizedPnL,
    realizedAt: new Date().toISOString()
  };

  pnlLedger.push(record);

savePnlRecord(record).catch(console.error);

  return record;
}

export function getRealizedPnlAnalytics() {
  const totalRealizedPnL =
    pnlLedger.reduce(
      (sum, trade) =>
        sum + trade.realizedPnL,
      0
    );

  const winningTrades =
    pnlLedger.filter(
      (trade) =>
        trade.realizedPnL > 0
    ).length;

  const losingTrades =
    pnlLedger.filter(
      (trade) =>
        trade.realizedPnL < 0
    ).length;

  return {
    totalRealizedPnL:
      Number(totalRealizedPnL.toFixed(2)),
    totalTrades: pnlLedger.length,
    winningTrades,
    losingTrades,
    trades: pnlLedger
  };
}