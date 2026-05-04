export function formatKES(value) {
  const n = Number(value || 0);
  return `KES ${n.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatPercent(value) {
  const n = Number(value || 0);
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function orderReference(symbol = "NSE") {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 89999);
  return `NSE-${year}-${symbol}-${rand}`;
}
