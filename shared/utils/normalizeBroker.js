export function normalizeBroker(value) {
  const broker = String(value || "AIB-AXYS").trim().toUpperCase();
  if (broker === "AIB") return "AIB-AXYS";
  if (broker === "ABC CAPITAL") return "ABC";
  return broker;
}
