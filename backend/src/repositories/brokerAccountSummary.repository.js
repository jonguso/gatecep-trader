const summaries = {};

function normalizeBroker(value) {
  const broker = String(value || "AIB-AXYS")
    .trim()
    .toUpperCase();

  if (broker === "AIB") return "AIB-AXYS";
  if (broker === "ABC CAPITAL") return "ABC";

  return broker;
}

function buildKey(
  broker,
  clientNumber,
  cdsNumber
) {
  return [
    normalizeBroker(broker),
    String(clientNumber || "").trim(),
    String(cdsNumber || "").trim()
  ].join("|");
}

export function saveBrokerAccountSummary(
  broker,
  summary = {}
) {
  const normalizedBroker =
    normalizeBroker(broker);

  const key = buildKey(
    normalizedBroker,
    summary.clientNumber,
    summary.cdsNumber
  );

  summaries[key] = {
    broker: normalizedBroker,

    clientNumber:
      summary.clientNumber || "",

    cdsNumber:
      summary.cdsNumber || "",

    email:
      summary.email || "",

    portfolioValue:
      Number(summary.portfolioValue || 0),

    ledgerBalance:
      Number(summary.ledgerBalance || 0),

    unsettledPurchaseValue:
      Number(summary.unsettledPurchaseValue || 0),

    unsettledSaleValue:
      Number(summary.unsettledSaleValue || 0),

    availableFunds:
      Number(
        summary.availableFunds ??
        summary.ledgerBalance ??
        0
      ),

    source:
      summary.source ||
      "BROKER_IMPORT",

    updatedAt:
      new Date().toISOString()
  };

  return summaries[key];
}

export function getBrokerAccountSummary(
  broker,
  clientNumber = "",
  cdsNumber = ""
) {
  const normalizedBroker =
    normalizeBroker(broker);

  const key = buildKey(
    normalizedBroker,
    clientNumber,
    cdsNumber
  );

  return (
    summaries[key] || {
      broker:
        normalizedBroker,

      clientNumber,

      cdsNumber,

      email: "",

      portfolioValue: 0,

      ledgerBalance: 0,

      unsettledPurchaseValue: 0,

      unsettledSaleValue: 0,

      availableFunds: 0,

      source: null,

      updatedAt: null
    }
  );
}

export function getAllBrokerAccountSummaries() {
  return Object.values(
    summaries
  );
}