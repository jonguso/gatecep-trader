export function formatKES(value) {
  const n = Number(value || 0);
  return `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPct(value) {
  const n = Number(value || 0);
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function orderRef(symbol = "NSE") {
  return `NSE-${new Date().getFullYear()}-${symbol}-${Math.floor(10000 + Math.random() * 90000)}`;
}
