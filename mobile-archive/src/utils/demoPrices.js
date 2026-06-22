import { nseSecurityMaster } from "./nseSecurityMaster";

export function getFallbackPrice(symbol) {
  const security =
    nseSecurityMaster[
      String(symbol || "").toUpperCase()
    ];

  return Number(
    security?.price || 10
  );
}

export function revalueHoldingsFallback(
  holdings = []
) {
  return holdings.map((item) => {
    const quantity =
      Number(item.quantity || 0);

    const marketPrice =
      getFallbackPrice(item.symbol);

    return {
      ...item,
      marketPrice,
      marketValue:
        quantity * marketPrice
    };
  });
}