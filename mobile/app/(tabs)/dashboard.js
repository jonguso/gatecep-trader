import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";
import { router, useFocusEffect } from "expo-router";
import { getCurrentSession } from "../../src/auth/authStore";

import { loadPortfolio } from "../../src/portfolio/portfolioStore";
import { calculatePortfolioHealth } from "../../src/portfolio/portfolioHealth";
import {
  loadPortfolioSnapshots,
  savePortfolioSnapshot
} from "../../src/portfolio/portfolioSnapshot";
import {
  userGetItem,
  userSetItem
} from "../../src/auth/userStorage";

import {
  fetchWatchlistMarketRows,
  generateWatchlistSignals,
  getDefaultWatchlist
} from "../../src/utils/watchlistSignals";
import { buildWatchlistScores } from "../../src/watchlist/watchlistScoring";
import ActiveUserBanner from "../../src/components/ActiveUserBanner";
import FloatingCoachG from "../../components/FloatingCoachG";

const COLORS = [
  "#06b6d4",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899"
];

export default function Dashboard() {
  const [holdings, setHoldings] = useState([]);
  const [cash, setCash] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [selectedSector, setSelectedSector] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [topSignals, setTopSignals] = useState([]);
  const [session, setSession] = useState(null);

  const [setupChecks, setSetupChecks] = useState({
    profile: false,
    broker: false,
    portfolio: false,
    portfolioUpload: false,
    cashUpload: false,
    transactionsUpload: false
  });

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    setLoading(true);
 
    const currentSession = await getCurrentSession();
setSession(currentSession);     

    const profileRaw = await userGetItem("investorProfile");

    const brokerRaw =
      (await AsyncStorage.getItem("gatecepBrokerProfile")) ||
      (await AsyncStorage.getItem("gatecepDefaultBrokerProfile"));

    const cashRaw = await userGetItem("availableCash");

    const portfolioUploadRaw = await AsyncStorage.getItem(
      "gatecepStatementUploaded"
    );

    const cashUploadRaw = await AsyncStorage.getItem(
      "gatecepCashStatementUploaded"
    );

    const transactionUploadRaw = await AsyncStorage.getItem(
      "gatecepTransactionsUploaded"
    );

    const parsedHoldings = await loadPortfolio({
      revalue: true
    });

    const snapshotData = await loadPortfolioSnapshots();

    setHoldings(parsedHoldings);
    setSnapshots(snapshotData);

    const parsedCash = Number(cashRaw || 0);
    setCash(Number.isFinite(parsedCash) ? parsedCash : 0);

    setSetupChecks({
      profile: !!profileRaw,
      broker: !!brokerRaw,
      portfolio: parsedHoldings.length > 0,
      portfolioUpload: portfolioUploadRaw === "true",
      cashUpload: cashUploadRaw === "true",
      transactionsUpload: transactionUploadRaw === "true"
    });

    await loadTopSignals();

    setLastUpdated(new Date().toLocaleString());
    setLoading(false);
  }

  async function loadTopSignals() {
    try {
      const watchlistRaw = await userGetItem("watchlist");

      const watchlist = watchlistRaw
        ? JSON.parse(watchlistRaw)
        : getDefaultWatchlist();

      const marketRows = await fetchWatchlistMarketRows(watchlist);
      const generated = generateWatchlistSignals(marketRows);
      const scored = buildWatchlistScores(generated);

      const ranked = scored
        .filter((item) => ["BUY", "ACCUMULATE", "INCOME"].includes(item.action))
        .sort((a, b) => Number(b.confidence || 0) - Number(a.confidence || 0))
        .slice(0, 3);

      setTopSignals(ranked);
    } catch (error) {
      console.log("Dashboard top signals failed:", error.message);
      setTopSignals([]);
    }
  }

  const investedValue = useMemo(() => {
    return holdings.reduce(
      (sum, h) =>
        sum +
        Number(h.quantity || 0) *
          Number(h.averagePrice || h.averageCost || 0),
      0
    );
  }, [holdings]);

  const currentValue = useMemo(() => {
    return holdings.reduce(
      (sum, h) => sum + Number(h.marketValue || h.value || 0),
      0
    );
  }, [holdings]);

  const netGainLoss = currentValue - investedValue;

  const gainLossPct =
    investedValue > 0 ? (netGainLoss / investedValue) * 100 : 0;

  const sectorRows = useMemo(() => {
    const sectors = {};

    holdings.forEach((h) => {
      const sector = h.sector || "Unknown";
      const value = Number(h.marketValue || h.value || 0);
      const profitLoss = Number(h.profitLoss || 0);
      const changePct = Number(h.marketChangePct || h.changePct || 0);

if (!sectors[sector]) {
  sectors[sector] = {
    sector,
    totalValue: 0,
    profitLoss: 0,
    changePctTotal: 0,
    changePctCount: 0,
    securities: []
  };
}

sectors[sector].totalValue += value;
sectors[sector].profitLoss += profitLoss;
sectors[sector].changePctTotal += changePct;
sectors[sector].changePctCount += 1;
sectors[sector].securities.push(h);      

    });

    return Object.values(sectors)
      .map((s) => {
  const sectorChangePct =
    s.changePctCount > 0
      ? s.changePctTotal / s.changePctCount
      : 0;

  return {
    ...s,
    sectorChangePct,
    trend: sectorChangePct >= 0 ? "UP" : "DOWN",
    weight: currentValue > 0 ? (s.totalValue / currentValue) * 100 : 0
  };
})
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [holdings, currentValue]);

  const sectorCount = sectorRows.length;

  const sectorTotalValue = useMemo(() => {
    return sectorRows.reduce(
      (sum, s) => sum + Number(s.totalValue || 0),
      0
    );
  }, [sectorRows]);

  const topHoldings = useMemo(() => {
    return [...holdings]
      .sort(
        (a, b) =>
          Number(b.marketValue || b.value || 0) -
          Number(a.marketValue || a.value || 0)
      )
      .slice(0, 3);
  }, [holdings]);

  const largestSector = sectorRows[0];

  const risk =
    Number(largestSector?.weight || 0) >= 35
      ? "HIGH_RISK"
      : Number(largestSector?.weight || 0) >= 30
      ? "MODERATE"
      : "BALANCED";

  const diversification =
    sectorRows.length >= 5
      ? "GOOD"
      : sectorRows.length >= 3
      ? "MODERATE"
      : "CONCENTRATED";

  const health = useMemo(() => {
    return calculatePortfolioHealth({
      holdings,
      cash,
      currentValue,
      sectorRows
    });
  }, [holdings, cash, currentValue, sectorRows]);

  const trend = useMemo(() => {
    const latest = snapshots[0];
    const first = snapshots[snapshots.length - 1];

    if (!latest || !first) return null;

    const change =
      Number(latest.totalValue || 0) - Number(first.totalValue || 0);

    const changePct =
      Number(first.totalValue || 0) > 0
        ? (change / Number(first.totalValue || 0)) * 100
        : 0;

    return {
      latest,
      first,
      change,
      changePct
    };
  }, [snapshots]);

  useEffect(() => {
    if (!loading && holdings.length > 0) {
      saveTodaySnapshot();
    }
  }, [
    loading,
    holdings.length,
    investedValue,
    currentValue,
    cash,
    health.score,
    health.rating,
    netGainLoss,
    gainLossPct
  ]);

  async function saveTodaySnapshot() {
    await savePortfolioSnapshot({
      investedValue,
      currentValue,
      cash,
      healthScore: health.score,
      healthRating: health.rating,
      netGainLoss,
      gainLossPct
    });

    const refreshed = await loadPortfolioSnapshots();
    setSnapshots(refreshed);
  }

  const missingSetupItems = [
    { label: "Investor Profile", done: setupChecks.profile },
    { label: "Broker Profile", done: setupChecks.broker },
    { label: "Portfolio Valuation", done: setupChecks.portfolioUpload },
    { label: "Cash Statement", done: setupChecks.cashUpload },
    { label: "Transaction History", done: setupChecks.transactionsUpload }
  ].filter((item) => !item.done);

  async function openCoach() {
    await userSetItem(
  "coachContext",
  JSON.stringify({
    largestSector: largestSector?.sector || "N/A",
    risk,
    cash,
    currentValue,
    investedValue,
    netGainLoss,
    gainLossPct,
    diversification,
    sectorCount,
    sectorRows,
    healthScore: health.score,
    healthRating: health.rating,
    healthComponents: health.components,
    healthStrengths: health.strengths,
    healthWatchlist: health.watchlist,
    timestamp: new Date().toISOString()
  })
);
<ActiveUserBanner />

    router.push("/coach-insights");
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#67e8f9" />
        <Text style={styles.loading}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable style={styles.icon} onPress={() => router.push("/menu")}>
          <Text style={styles.iconText}>☰</Text>
        </Pressable>

        <Text style={styles.title}>Dashboard</Text>

        <Pressable
  style={styles.bellButton}
  onPress={() => router.push("/alerts")}
>
  <Text style={styles.bell}>🔔</Text>
</Pressable>
 </View>       
      <Text style={styles.subtitle}>Gatecep investor command center</Text>
      <Text style={styles.userLine}>
  Logged in as {session?.username || session?.userId || "Guest"}
</Text>
      <Text style={styles.timestamp}>Updated {lastUpdated}</Text>
      <ActiveUserBanner />
      <View style={styles.summaryOuter}>
        <View style={styles.summaryTopPlain}>
          <PlainMetric
            label="Invested Value"
            value={`KES ${money(investedValue)}`}
            color="white"
          />

          <PlainMetric
            label="Current Value"
            value={`KES ${money(currentValue)}`}
            color="#67e8f9"
          />

          <PlainMetric
            label="Net Gain/Loss"
            value={`KES ${money(netGainLoss)} (${gainLossPct.toFixed(2)}%)`}
            color={netGainLoss >= 0 ? "#86efac" : "#fca5a5"}
          />

          <PlainMetric
            label="Available Cash"
            value={`KES ${money(cash)}`}
            color="#86efac"
            sub="Broker trading space"
          />
        </View>

        <View style={styles.summaryRiskRow}>
          <Metric
            label="Risk"
            value={risk}
            color={risk === "HIGH_RISK" ? "#fca5a5" : "#86efac"}
          />

          <Metric label="Sectors" value={String(sectorCount)} color="#67e8f9" />
        </View>
      </View>

      {trend && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Portfolio Trend</Text>

          <Text style={styles.body}>
            Current total value is{" "}
            <Text style={styles.highlight}>
              KES {money(trend.latest.totalValue)}
            </Text>
            .
          </Text>

          <Text style={styles.body}>
            Since first snapshot on {trend.first.date}, portfolio changed by{" "}
            <Text
              style={trend.change >= 0 ? styles.greenText : styles.redText}
            >
              KES {money(trend.change)} ({trend.changePct.toFixed(2)}%)
            </Text>
            .
          </Text>

          <Pressable
            style={styles.secondary}
            onPress={() => router.push("/performance")}
          >
            <Text style={styles.secondaryText}>Open Performance</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.summaryBottom}>
        <Metric label="Diversification" value={diversification} color="#67e8f9" />

        <Metric
          label="Largest Sector"
          value={
            largestSector
              ? `${largestSector.sector} (${Number(
                  largestSector.weight || 0
                ).toFixed(2)}%)`
              : "N/A"
          }
          color="#c084fc"
        />
      </View>

      {missingSetupItems.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Setup Remaining</Text>

          {missingSetupItems.map((item) => (
            <StatusRow key={item.label} label={item.label} done={false} />
          ))}
        </View>
      )}

      <View style={styles.coachSummary}>
        <Text style={styles.cardTitle}>Coach G Summary</Text>

        <Text style={styles.body}>
          Portfolio Health is{" "}
          <Text style={styles.highlight}>
            {health.score}/100 ({health.rating})
          </Text>
          . Risk is <Text style={styles.highlight}>{risk}</Text>.
          Diversification is{" "}
          <Text style={styles.highlight}>{diversification}</Text>.
        </Text>

        {health.strengths.slice(0, 2).map((item) => (
          <Text key={item} style={styles.body}>
            ✓ {item}
          </Text>
        ))}

        {health.watchlist.slice(0, 2).map((item) => (
          <Text key={item} style={styles.body}>
            ⚠ {item}
          </Text>
        ))}

        <Text style={styles.body}>
          {largestSector
            ? `${largestSector.sector} is the largest sector at ${Number(
                largestSector.weight || 0
              ).toFixed(2)}%.`
            : "No sector exposure available yet."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Coach G Signals</Text>

        {topSignals.length === 0 ? (
          <Text style={styles.body}>
            No strong signals right now. Open Watchlist to monitor opportunities.
          </Text>
        ) : (
          topSignals.map((item) => (
            <View key={item.symbol} style={styles.signalRow}>
              <View>
                <Text style={styles.holdingSymbol}>{item.symbol}</Text>
                <Text style={styles.small}>{item.name}</Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={signalActionStyle(item.action)}>{item.action}</Text>
                <Text style={styles.valueText}>{item.confidence}%</Text>
              </View>
            </View>
          ))
        )}

        <Pressable
          style={styles.secondary}
          onPress={() => router.push("/watchlist")}
        >
          <Text style={styles.secondaryText}>Open Watchlist</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Holdings</Text>

        {topHoldings.length === 0 ? (
          <Text style={styles.body}>
            No holdings found yet. Upload portfolio valuation or create a starter
            portfolio.
          </Text>
        ) : (
          topHoldings.map((h, index) => (
            <View key={`${h.symbol}-${index}`} style={styles.holdingRow}>
              <View>
                <Text style={styles.holdingSymbol}>{h.symbol || "N/A"}</Text>
                <Text style={styles.small}>
                  {h.sector || "Unknown"} • Qty{" "}
                  {Number(h.quantity || 0).toLocaleString()}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.valueText}>
                  KES {money(h.marketValue || h.value)}
                </Text>

                <Text
                  style={
                    Number(h.profitLoss || 0) >= 0
                      ? styles.greenText
                      : styles.redText
                  }
                >
                  KES {money(h.profitLoss)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Text style={styles.section}>Sector Allocation</Text>

      <View style={styles.sectorContainer}>
        <View style={styles.chartPanel}>
          <SectorDonut
            data={sectorRows}
            total={sectorTotalValue}
            onSelect={setSelectedSector}
          />
        </View>

        <View style={styles.tablePanel}>
          <View style={styles.tableHeader}>
            <Text style={styles.sectorHeader}>Sector</Text>
            <Text style={styles.valueHeader}>Value</Text>
            <Text style={styles.weightHeader}>Weight</Text>
          </View>

          {sectorRows.length === 0 ? (
            <Text style={styles.body}>No sector data available.</Text>
          ) : (
            sectorRows.map((s, index) => (
              <Pressable
                key={s.sector}
                style={styles.tableRow}
                onPress={() => setSelectedSector(s)}
              >
                <View style={styles.sectorCol}>
                  <View style={styles.sectorNameWrap}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: COLORS[index % COLORS.length] }
                      ]}
                    />

                    <Text
  style={
    Number(s.sectorChangePct || 0) >= 0
      ? styles.sectorUpText
      : styles.sectorDownText
  }
>
  {Number(s.sectorChangePct || 0) >= 0 ? "▲" : "▼"} {s.sector}
</Text>

                  </View>
                </View>

                <Text style={styles.valueCol}>KES {money(s.totalValue)}</Text>
                <Text style={styles.weightCol}>
                  {Number(s.weight || 0).toFixed(2)}%
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>

        <View style={styles.actionGrid}>
          <ActionButton title="Trade" route="/trade" />
          <ActionButton title="Command Center" route="/portfolio-command-center" />
          <ActionButton title="Deposit Funds" route="/funds" />
          <ActionButton title="Connect Broker" route="/broker-profile" />
        </View>

        <Pressable style={styles.primary} onPress={openCoach}>
          <Text style={styles.primaryText}>Open Coach G Insights</Text>
        </Pressable>
      </View>

      <SectorModal sector={selectedSector} onClose={() => setSelectedSector(null)} />

      <FloatingCoachG />
    </ScrollView>
  );
}

function StatusRow({ label, done }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={done ? styles.statusDone : styles.statusMissing}>
        {done ? "DONE" : "MISSING"}
      </Text>
    </View>
  );
}

function ActionButton({ title, route }) {
  return (
    <Pressable style={styles.actionButton} onPress={() => router.push(route)}>
      <Text style={styles.actionText}>{title}</Text>
    </Pressable>
  );
}

function PlainMetric({ label, value, color, sub }) {
  return (
    <View style={styles.plainMetric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
    </View>
  );
}

function Metric({ label, value, color }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

function SectorModal({ sector, onClose }) {
  if (!sector) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.sectorPopup}>
          <View style={styles.popupHeader}>
            <View>
              <Text style={styles.popupTitle}>{sector.sector}</Text>
              <Text style={styles.popupSub}>
                {sector.securities.length} securities • KES{" "}
                {money(sector.totalValue)}
              </Text>
            </View>

            <Pressable style={styles.closeCircle} onPress={onClose}>
              <Text style={{ color: "white" }}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            {sector.securities.map((sec, index) => (
              <View key={`${sec.symbol}-${index}`} style={styles.securityCard}>
                <View style={styles.compactTop}>
                  <Text style={styles.securitySymbol}>{sec.symbol}</Text>

                  <Text
                    style={
                      Number(sec.profitLoss || 0) >= 0
                        ? styles.greenText
                        : styles.redText
                    }
                  >
                    KES {money(sec.profitLoss)}
                  </Text>
                </View>

                <View style={styles.compactMetrics}>
                  <InfoBox
                    label="Qty"
                    value={Number(sec.quantity || 0).toLocaleString()}
                  />
                  <InfoBox
                    label="Price"
                    value={`KES ${money(sec.marketPrice || sec.price)}`}
                  />
                  <InfoBox
                    label="Value"
                    value={`KES ${money(sec.marketValue || sec.value)}`}
                  />
                  <InfoBox
                    label="Return"
                    value={`${Number(sec.changePct || 0).toFixed(2)}%`}
                    positive={Number(sec.changePct || 0) >= 0}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InfoBox({ label, value, positive }) {
  return (
    <View style={styles.infoCompact}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={
          positive === undefined
            ? styles.infoValue
            : positive
            ? styles.greenText
            : styles.redText
        }
      >
        {value}
      </Text>
    </View>
  );
}

function SectorDonut({ data, total, onSelect }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={260} height={260}>
        <G x={130} y={130}>
          {data.map((item, index) => {
            const start = data
              .slice(0, index)
              .reduce((sum, x) => sum + x.weight, 0);

            const end = start + item.weight;
            const labelAngle = ((start + end) / 2) * 3.6;
            const labelPos = polar(0, 0, 112, labelAngle);

            return (
              <G key={item.sector}>
                <Path
                  d={describeArc(0, 0, 100, 58, start * 3.6, end * 3.6)}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#020617"
                  strokeWidth={2}
                  onPress={() => onSelect(item)}
                  onPressIn={() => onSelect(item)}
                />

                {item.weight >= 3 && (
                  <SvgText
                    x={labelPos.x}
                    y={labelPos.y}
                    fill="white"
                    fontSize="10"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    {Number(item.weight).toFixed(1)}%
                  </SvgText>
                )}
              </G>
            );
          })}

          <Circle cx={0} cy={0} r={58} fill="#020617" />

          <SvgText y="-14" fill="#94a3b8" textAnchor="middle" fontSize="10">
            Total Value
          </SvgText>

          <SvgText y="2" fill="#94a3b8" textAnchor="middle" fontSize="10">
            KES
          </SvgText>

          <SvgText y="22" fill="white" textAnchor="middle" fontSize="14" fontWeight="900">
            {money(total)}
          </SvgText>
        </G>
      </Svg>
    </View>
  );
}

function signalActionStyle(action) {
  if (action === "BUY") return styles.signalBuy;
  if (action === "ACCUMULATE") return styles.signalAccumulate;
  if (action === "INCOME") return styles.signalIncome;
  return styles.signalHold;
}

function money(v) {
  return Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function polar(cx, cy, r, a) {
  const rad = ((a - 90) * Math.PI) / 180;

  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}

function describeArc(cx, cy, outer, inner, start, end) {
  const large = end - start > 180 ? 1 : 0;
  const o1 = polar(cx, cy, outer, end);
  const o2 = polar(cx, cy, outer, start);
  const i1 = polar(cx, cy, inner, start);
  const i2 = polar(cx, cy, inner, end);

  return `
    M ${o1.x} ${o1.y}
    A ${outer} ${outer} 0 ${large} 0 ${o2.x} ${o2.y}
    L ${i1.x} ${i1.y}
    A ${inner} ${inner} 0 ${large} 1 ${i2.x} ${i2.y}
    Z
  `;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
  center: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center"
  },
  loading: { color: "#cbd5e1", marginTop: 10 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center"
  },
  iconText: { color: "white", fontSize: 22 },
  title: { fontSize: 32, fontWeight: "900", color: "white" },
  subtitle: { marginTop: 10, color: "#94a3b8" },
  timestamp: { color: "#64748b", marginTop: 6, fontSize: 12 },

  summaryOuter: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16
  },
  summaryTopPlain: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 20
  },
  plainMetric: { width: "50%" },
  summaryRiskRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10
  },
  summaryBottom: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10
  },
  metric: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1
  },
  metricLabel: { color: "#94a3b8" },
  metricValue: { marginTop: 8, fontWeight: "900" },
  metricSub: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 4
  },

  card: {
    marginTop: 16,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    padding: 18,
    borderRadius: 20
  },
  cardTitle: { color: "#67e8f9", fontWeight: "900", fontSize: 18 },
  body: { marginTop: 10, color: "#cbd5e1", lineHeight: 21 },
  small: { color: "#94a3b8", marginTop: 4, fontSize: 12 },
  whiteText: { color: "white", fontWeight: "900" },
  valueText: { color: "white", fontWeight: "900" },
  highlight: { color: "#c084fc", fontWeight: "900" },
  greenText: { color: "#86efac", fontWeight: "900" },
  redText: { color: "#fca5a5", fontWeight: "900" },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 12
  },
  statusLabel: { color: "white", fontWeight: "800" },
  statusDone: { color: "#86efac", fontWeight: "900" },
  statusMissing: { color: "#fca5a5", fontWeight: "900" },

  holdingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 14,
    gap: 12
  },
  holdingSymbol: { color: "white", fontSize: 16, fontWeight: "900" },

  signalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 14,
    gap: 12
  },
  signalBuy: { color: "#22c55e", fontWeight: "900" },
  signalAccumulate: { color: "#67e8f9", fontWeight: "900" },
  signalIncome: { color: "#fbbf24", fontWeight: "900" },
  signalHold: { color: "#a78bfa", fontWeight: "900" },

  section: {
    marginTop: 24,
    fontSize: 24,
    fontWeight: "900",
    color: "white"
  },
  sectorContainer: {
    marginTop: 16,
    flexDirection: "column",
    gap: 18
  },
sectorUpText: {
  color: "#86efac",
  fontWeight: "900"
},

sectorDownText: {
  color: "#fca5a5",
  fontWeight: "900"
},
  chartPanel: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    justifyContent: "center",
    alignItems: "center"
  },
  tablePanel: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingBottom: 10
  },
  sectorHeader: { flex: 1.4, color: "#94a3b8", fontSize: 12 },
  valueHeader: { flex: 1, color: "#94a3b8", fontSize: 12, textAlign: "right" },
  weightHeader: { flex: 0.7, color: "#94a3b8", fontSize: 12, textAlign: "right" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 12
  },
  sectorCol: { flex: 1.4 },
  valueCol: { flex: 1, color: "white", fontWeight: "900", textAlign: "right" },
  weightCol: { flex: 0.7, color: "white", fontWeight: "900", textAlign: "right" },
  sectorNameWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 8 },

  coachSummary: {
    marginTop: 16,
    backgroundColor: "rgba(147,51,234,.13)",
    borderColor: "rgba(147,51,234,.35)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },

  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14
  },
  actionButton: {
    width: "47%",
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16
  },
  actionText: {
    color: "#67e8f9",
    textAlign: "center",
    fontWeight: "900"
  },

  primary: {
    marginTop: 18,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 16
  },
  primaryText: { color: "white", textAlign: "center", fontWeight: "900" },
  secondary: {
    marginTop: 14,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16
  },
  secondaryText: {
    color: "#67e8f9",
    textAlign: "center",
    fontWeight: "900"
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  sectorPopup: {
    width: "92%",
    maxWidth: 760,
    backgroundColor: "#0f172a",
    borderRadius: 28,
    padding: 20,
    borderColor: "#334155",
    borderWidth: 1
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  popupTitle: { fontSize: 24, fontWeight: "900", color: "white" },
  popupSub: { color: "#94a3b8", marginTop: 6 },
  closeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center"
  },
  securityCard: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginTop: 10
  },
  compactTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  userLine: {
  color: "#67e8f9",
  marginTop: 6,
  fontWeight: "900"
},
  compactMetrics: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8
  },
  securitySymbol: { color: "white", fontSize: 17, fontWeight: "900" },
  infoCompact: { flex: 1 },
  infoLabel: { color: "#94a3b8", fontSize: 10 },
  infoValue: { color: "white", fontWeight: "900", marginTop: 4, fontSize: 12 }
});