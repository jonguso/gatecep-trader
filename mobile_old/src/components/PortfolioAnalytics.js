import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { P } from "../theme/proTheme";
import { kes } from "../utils/money";

const COLORS = ["#2563EB", "#22C55E", "#EF4444", "#F59E0B", "#A855F7", "#06B6D4", "#F97316", "#84CC16"];

function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180.0;
  return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", cx, cy, "L", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y, "Z"].join(" ");
}

export function AllocationPie({ data = [], title }) {
  const total = data.reduce((s, x) => s + Number(x.value || 0), 0);
  let startAngle = 0;

  const slices = data.filter(x => Number(x.value || 0) > 0).map((x, i) => {
    const pct = Number(x.value || 0) / (total || 1);
    const endAngle = startAngle + pct * 360;
    const path = describeArc(80, 80, 72, startAngle, endAngle);
    const row = { ...x, pct, path, color: COLORS[i % COLORS.length] };
    startAngle = endAngle;
    return row;
  });

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.chartRow}>
        <Svg width={160} height={160}>
          <G>
            {slices.map((s, i) => <Path key={i} d={s.path} fill={s.color} />)}
            <Circle cx={80} cy={80} r={38} fill={P.color.surface} />
          </G>
        </Svg>

        <View style={styles.legend}>
          {slices.slice(0, 6).map((s, i) => (
            <View key={i} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: s.color }]} />
              <Text style={styles.legendText} numberOfLines={1}>{s.label} {(s.pct * 100).toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export function buildPortfolioAnalytics({ holdings = [], availableFunds = 0 }) {
  const totalHoldings = holdings.reduce((s, h) => s + Number(h.marketValue || 0), 0);
  const total = totalHoldings + Number(availableFunds || 0);

  const bySecurity = holdings.map(h => ({ label: h.symbol, value: Number(h.marketValue || 0) }));

  const sectorMap = {};
  holdings.forEach(h => {
    const sector = h.sector || h.industry || h.category || "Other";
    sectorMap[sector] = (sectorMap[sector] || 0) + Number(h.marketValue || 0);
  });

  const bySector = Object.keys(sectorMap).map(k => ({ label: k, value: sectorMap[k] }));

  const largestHolding = [...holdings].sort((a, b) => Number(b.marketValue || 0) - Number(a.marketValue || 0))[0];
  const largestPct = totalHoldings > 0 && largestHolding ? (Number(largestHolding.marketValue || 0) / totalHoldings) * 100 : 0;

  const largestSector = [...bySector].sort((a, b) => b.value - a.value)[0];
  const largestSectorPct = totalHoldings > 0 && largestSector ? (largestSector.value / totalHoldings) * 100 : 0;

  const cashPct = total > 0 ? (Number(availableFunds || 0) / total) * 100 : 0;

  let riskScore = 35;
  if (largestPct > 50) riskScore += 25;
  else if (largestPct > 35) riskScore += 15;
  else if (largestPct > 20) riskScore += 8;
  if (largestSectorPct > 60) riskScore += 20;
  else if (largestSectorPct > 45) riskScore += 12;
  else if (largestSectorPct > 30) riskScore += 6;
  if (holdings.length < 3) riskScore += 15;
  else if (holdings.length < 5) riskScore += 8;
  if (cashPct < 5) riskScore += 6;
  if (cashPct > 70) riskScore += 5;
  riskScore = Math.min(100, Math.max(0, Math.round(riskScore)));

  const insights = [];
  if (largestHolding) insights.push(`${largestHolding.symbol} is your largest position at ${largestPct.toFixed(1)}% of holdings.`);
  if (largestSector) insights.push(`${largestSector.label} is your largest industry at ${largestSectorPct.toFixed(1)}% of holdings.`);
  if (largestPct > 40) insights.push("Coach G: Your portfolio is concentrated in one security. Consider diversifying.");
  else insights.push("Coach G: Security concentration is within a healthier range.");
  if (largestSectorPct > 50) insights.push("Coach G: You may be overweight in one industry. Review sector exposure.");
  if (cashPct > 50) insights.push("Coach G: High cash allocation. You have dry powder for opportunities.");
  else if (cashPct < 10) insights.push("Coach G: Low cash allocation. Keep liquidity for new trades or fees.");

  return {
    totalHoldings, total, bySecurity, bySector, largestHolding, largestPct, largestSector,
    largestSectorPct, cashPct, riskScore,
    riskLabel: riskScore >= 70 ? "High Risk" : riskScore >= 45 ? "Moderate Risk" : "Lower Risk",
    insights
  };
}

export function AnalyticsSummary({ analytics }) {
  const riskColor = analytics.riskScore >= 70 ? P.color.red : analytics.riskScore >= 45 ? P.color.amber : P.color.green;

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.chartTitle}>AI Portfolio Analytics</Text>
      <View style={styles.riskRow}>
        <Text style={[styles.riskScore, { color: riskColor }]}>{analytics.riskScore}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.riskLabel}>{analytics.riskLabel}</Text>
          <Text style={styles.muted}>Based on concentration, industry exposure, holdings count, and cash allocation.</Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric label="Holdings" value={kes(analytics.totalHoldings)} />
        <Metric label="Cash %" value={`${analytics.cashPct.toFixed(1)}%`} />
        <Metric label="Top Holding" value={analytics.largestHolding?.symbol || "-"} />
        <Metric label="Top Industry" value={analytics.largestSector?.label || "-"} />
      </View>

      <View style={styles.insights}>
        {analytics.insights.map((x, i) => <Text key={i} style={styles.insight}>• {x}</Text>)}
      </View>
    </View>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: { backgroundColor: P.color.surface, borderRadius: P.radius.lg, borderWidth: 1, borderColor: P.color.border, padding: 16, marginHorizontal: P.spacing.screen, marginBottom: 12 },
  chartTitle: { color: P.color.text, fontSize: 18, fontWeight: "900", marginBottom: 10 },
  chartRow: { flexDirection: "row", alignItems: "center" },
  legend: { flex: 1, gap: 7 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: P.color.text, fontSize: 12, flex: 1 },
  summaryCard: { backgroundColor: P.color.surface, borderRadius: P.radius.lg, borderWidth: 1, borderColor: P.color.border, padding: 16, marginHorizontal: P.spacing.screen, marginBottom: 12 },
  riskRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
  riskScore: { fontSize: 44, fontWeight: "900" },
  riskLabel: { color: P.color.text, fontWeight: "900", fontSize: 16 },
  muted: { color: P.color.muted, lineHeight: 18, fontSize: 12, marginTop: 3 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metric: { width: "48%", backgroundColor: P.color.bg, borderRadius: P.radius.md, borderWidth: 1, borderColor: P.color.border, padding: 10 },
  metricLabel: { color: P.color.muted, fontSize: 11 },
  metricValue: { color: P.color.text, fontWeight: "900", marginTop: 4 },
  insights: { marginTop: 12 },
  insight: { color: P.color.text, lineHeight: 19, fontSize: 12, marginBottom: 4 }
});
