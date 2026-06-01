const valuations = {};

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

function makeValuationKey(row = {}) {
  return [
    String(row.symbol || "").toUpperCase(),
    Number(row.quantity || 0),
    Number(row.marketValue || 0)
  ].join("|");
}

export function saveBrokerValuation(
  broker,
  rows = [],
  options = {}
) {

  const normalizedBroker =
    normalizeBroker(broker);

  const key = buildKey(
    normalizedBroker,
    options.clientNumber,
    options.cdsNumber
  );

  const existing =
    valuations[key] || [];

  const map = new Map();

  existing.forEach((row)=>{

    map.set(
      makeValuationKey(row),
      row
    );

  });

  rows.forEach((row)=>{

    const enriched = {

      ...row,

      broker:
        normalizedBroker,

      clientNumber:
        options.clientNumber || "",

      cdsNumber:
        options.cdsNumber || "",

      email:
        options.email || "",

      brokerLinkId:
        options.brokerLinkId || "",

      importedAt:
        new Date().toISOString()

    };

    map.set(
      makeValuationKey(enriched),
      enriched
    );

  });

  valuations[key] =
    Array.from(
      map.values()
    );

  return valuations[key];
}

export function getBrokerValuation(
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

  return valuations[key] || [];
}

export function getAllBrokerValuations() {

  return valuations;

}