export function kes(value) {
  const n = Number(value || 0);
  return `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function pct(value) {
  const n = Number(value || 0);
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function ref(symbol = "NSE") {
  return `NSE-${new Date().getFullYear()}-${symbol}-${Math.floor(10000 + Math.random() * 90000)}`;
}
