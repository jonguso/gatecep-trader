import {
  normalizeNseSymbol
} from "../../data/nseSecurityMaster.js";

function cleanNumber(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return 0;
  }

  let str = String(value).trim();

  const negativeByParentheses =
    str.includes("(") &&
    str.includes(")");

  str = str
  .replace(/KES/gi,"")
  .replace(/[(),]/g,"")
  .replace(/\s/g,"")
   .replaceAll("'","");

  const num = Number(str);

  if (Number.isNaN(num)) {
    return 0;
  }

  return negativeByParentheses
    ? -Math.abs(num)
    : num;
}

function firstValue(row = {}, keys = []) {
  for (const key of keys) {
    if (
      row[key] !== undefined &&
      row[key] !== null &&
      row[key] !== ""
    ) {
      return row[key];
    }
  }

  return "";
}

export function normalizeHolding(row = {}) {
  const rawSymbol = firstValue(row, [
    "symbol",
    "Symbol",
    "Security",
    "Security Code",
    "Counter"
  ]);

  return {
    broker: String(row.broker || "AIB").toUpperCase(),
    symbol: normalizeNseSymbol(rawSymbol),
    name: firstValue(row, [
      "name",
      "Name",
      "Security Name"
    ]),
    quantity: cleanNumber(
      firstValue(row, [
        "quantity",
        "Quantity",
        "Holdings Quantity (Free)"
      ])
    ),
    blockedQuantity: cleanNumber(
      firstValue(row, [
        "blockedQuantity",
        "Used / Blocked Quantity"
      ])
    ),
    availableQuantity: cleanNumber(
      firstValue(row, [
        "availableQuantity",
        "Available Quantity"
      ])
    )
  };
}

export function normalizeValuation(row = {}) {
  const rawSymbol = firstValue(row, [
    "symbol",
    "Symbol",
    "Security",
    "Security Code",
    "Counter"
  ]);

  const quantity = cleanNumber(
    firstValue(row, ["quantity", "Quantity"])
  );

  const averagePrice = cleanNumber(
    firstValue(row, [
      "averagePrice",
      "Avg.Price",
      "Avg Price",
      "AvgPrice",
      "Average Price"
    ])
  );

  const marketPrice = cleanNumber(
    firstValue(row, ["marketPrice", "Market Price", "Price"])
  );

  const marketValue = cleanNumber(
    firstValue(row, ["marketValue", "Market Value", "Value"])
  );

  let profitLoss = cleanNumber(
    firstValue(row, [
      "profitLoss",
      "Profit / Loss",
      "Profit/Loss",
      "P/L",
      "PnL"
    ])
  );

  let profitLossPct = cleanNumber(
    firstValue(row, [
      "profitLossPct",
      "Profit / Loss %",
      "Profit/Loss %",
      "P/L %",
      "PnL %"
    ])
  );

  const calculatedProfitLoss = Number(
    (marketValue - quantity * averagePrice).toFixed(2)
  );

  if (
    profitLoss === 0 &&
    quantity > 0 &&
    averagePrice > 0 &&
    marketValue > 0
  ) {
    profitLoss = calculatedProfitLoss;
  }

  if (
    Math.abs(profitLoss) > Math.abs(marketValue) ||
    (profitLossPct < 0 && profitLoss > 0)
  ) {
    profitLoss = calculatedProfitLoss;
  }

  const costValue = quantity * averagePrice;

  if (profitLossPct === 0 && costValue > 0) {
    profitLossPct = Number(((profitLoss / costValue) * 100).toFixed(2));
  }

  return {
    broker: String(row.broker || "AIB").toUpperCase(),
    symbol: normalizeNseSymbol(rawSymbol),
    quantity,
    averagePrice,
    marketPrice,
    marketValue,
    profitLoss,
    profitLossPct
  };
}
export function normalizeOrder(row = {}) {
  const rawSymbol = firstValue(row, [
    "symbol",
    "Symbol",
    "Security",
    "Security Code",
    "Counter"
  ]);

  return {
    broker: String(row.broker || "AIB").toUpperCase(),
    symbol: normalizeNseSymbol(rawSymbol),
    side: firstValue(row, [
      "side",
      "Side",
      "Type"
    ]),
    quantity: cleanNumber(
      firstValue(row, [
        "quantity",
        "Quantity"
      ])
    ),
    price: cleanNumber(
      firstValue(row, [
        "price",
        "Price"
      ])
    ),
    status: firstValue(row, [
      "status",
      "Status"
    ])
  };
}

export function normalizeTransaction(row = {}) {
  const rawSymbol = firstValue(row, [
    "symbol",
    "Symbol",
    "Security",
    "Security Code",
    "Counter"
  ]);

  return {
    broker: String(row.broker || "AIB").toUpperCase(),
    date: firstValue(row, [
      "date",
      "Date"
    ]),
    symbol: normalizeNseSymbol(rawSymbol),
    type: firstValue(row, [
      "type",
      "Type"
    ]),
    quantity: cleanNumber(
      firstValue(row, [
        "quantity",
        "Quantity"
      ])
    ),
    price: cleanNumber(
      firstValue(row, [
        "price",
        "Price"
      ])
    ),
    amount: cleanNumber(
      firstValue(row, [
        "amount",
        "Amount"
      ])
    )
  };
}