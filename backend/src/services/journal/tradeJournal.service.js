const journalEntries = [];

function gradeTrade(pnlPercent) {
  if (pnlPercent >= 15) return "A";
  if (pnlPercent >= 8) return "B";
  if (pnlPercent >= 0) return "C";
  if (pnlPercent >= -10) return "D";
  return "F";
}

function detectBehavior(entry) {
  if (
    entry.reason?.toLowerCase().includes("fear")
  ) {
    return "EMOTIONAL_FEAR";
  }

  if (
    entry.reason?.toLowerCase().includes("fomo")
  ) {
    return "FOMO_CHASING";
  }

  if (
    entry.reason?.toLowerCase().includes("dip")
  ) {
    return "DIP_BUYING";
  }

  return "DISCIPLINED";
}

export function createJournalEntry(payload) {
  const quantity = Number(payload.quantity || 0);
  const entryPrice = Number(payload.entryPrice || 0);
  const currentPrice = Number(payload.currentPrice || 0);

  const invested = quantity * entryPrice;
  const currentValue = quantity * currentPrice;

  const pnl = currentValue - invested;

  const pnlPercent =
    invested > 0
      ? (pnl / invested) * 100
      : 0;

  const entry = {
    id: `JRN-${Date.now()}`,
    createdAt: new Date().toISOString(),

    symbol: payload.symbol,
    side: payload.side || "BUY",

    broker: payload.broker || "UNKNOWN",

    quantity,
    entryPrice,
    currentPrice,

    invested: Number(invested.toFixed(2)),
    currentValue: Number(currentValue.toFixed(2)),

    pnl: Number(pnl.toFixed(2)),
    pnlPercent: Number(pnlPercent.toFixed(2)),

    aiConfidence: Number(payload.aiConfidence || 50),

    holdingDays: Number(payload.holdingDays || 0),

    reason: payload.reason || "",

    behaviorTag: detectBehavior(payload),

    tradeGrade: gradeTrade(pnlPercent),

    coachGReview:
      pnlPercent >= 15
        ? "Excellent execution. Strong trade structure and disciplined positioning."
        : pnlPercent >= 0
        ? "Trade is profitable. Continue monitoring risk and momentum."
        : pnlPercent >= -10
        ? "Trade is under pressure. Risk management review recommended."
        : "Significant drawdown detected. Coach G recommends reviewing entry discipline and position sizing."
  };

  journalEntries.unshift(entry);

  return entry;
}

export function getTradeJournal() {
  return journalEntries;
}