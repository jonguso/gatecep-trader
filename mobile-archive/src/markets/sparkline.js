export function generateSparkline(changePct = 0) {
  if (changePct >= 3) return "▁▂▃▄▅▆▇█";
  if (changePct >= 1) return "▁▂▃▄▅▆▇";
  if (changePct >= 0) return "▁▂▃▄▅";
  if (changePct >= -1) return "▅▄▃▂▁";
  return "█▇▆▅▄▃▂▁";
}