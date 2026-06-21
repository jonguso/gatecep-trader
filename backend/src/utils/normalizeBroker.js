export function normalizeBroker(value) {
  const broker = String(value || "AIB").trim().toUpperCase();

  if (broker.includes("AIB")) return "AIB";
  if (broker.includes("ABC")) return "ABC";
  if (broker.includes("NCBA")) return "NCBA";

  return broker || "AIB";
}
