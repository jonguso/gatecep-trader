export function normalizeNseSymbol(value) {
  return String(value || "").trim().toUpperCase().replace(".NR", "");
}
