import {
  normalizeNseSymbol
} from "../../data/nseSecurityMaster.js";

function numberValue(value) {
  return Number(
    String(value || 0)
      .replaceAll(",", "")
      .trim()
  );
}

export function normalizeHolding(row = {}) {
  const rawSymbol =
    row.symbol ||
    row.Symbol ||
    row["Security Code"] ||
    row["Security"] ||
    row["Counter"] ||
    "";

  const symbol = normalizeNseSymbol(rawSymbol);

  return {
    broker: row.broker || "",
    symbol,
    name:
      row.name ||
      row.Name ||
      row["Security Name"] ||
      "",
    quantity: numberValue(
      row.quantity ||
        row.Quantity ||
        row["Holdings Quantity (Free)"] ||
        row["Quantity"] ||
        0
    ),
    blockedQuantity: numberValue(
      row.blockedQuantity ||
        row["Used / Blocked Quantity"] ||
        0
    ),
    availableQuantity: numberValue(
      row.availableQuantity ||
        row["Available Quantity"] ||
        0
    )
  };
}

export function normalizeValuation(row = {}) {
  const rawSymbol =
    row.symbol ||
    row.Symbol ||
    row["Security Code"] ||
    row["Counter"] ||
    "";

  return {
    broker: row.broker || "",
    symbol: normalizeNseSymbol(rawSymbol),
    name:
      row.name ||
      row.Name ||
      row["Security Name"] ||
      "",
    quantity: numberValue(row.quantity || row.Quantity || 0),
    price: numberValue(row.price || row.Price || row["Market Price"] || 0),
    marketValue: numberValue(
      row.marketValue || row["Market Value"] || row.Value || 0
    )
  };
}

export function normalizeOrder(row = {}) {
  const rawSymbol =
    row.symbol ||
    row.Symbol ||
    row["Security Code"] ||
    row["Counter"] ||
    "";

  return {
    broker: row.broker || "",
    symbol: normalizeNseSymbol(rawSymbol),
    side: row.side || row.Side || row.Type || "",
    quantity: numberValue(row.quantity || row.Quantity || 0),
    price: numberValue(row.price || row.Price || 0),
    status: row.status || row.Status || ""
  };
}

export function normalizeTransaction(row = {}) {
  const rawSymbol =
    row.symbol ||
    row.Symbol ||
    row["Security Code"] ||
    row["Counter"] ||
    "";

  return {
    broker: row.broker || "",
    date: row.date || row.Date || "",
    symbol: normalizeNseSymbol(rawSymbol),
    type: row.type || row.Type || "",
    quantity: numberValue(row.quantity || row.Quantity || 0),
    price: numberValue(row.price || row.Price || 0),
    amount: numberValue(row.amount || row.Amount || 0)
  };
}