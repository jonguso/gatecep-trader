import React, { useEffect, useMemo, useState } from "react";
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
import { router } from "expo-router";
import {
calculatePortfolioAnalytics
} from "../../src/utils/portfolioAnalytics";

import {
revalueHoldingsWithDemoPrices
} from "../../src/utils/demoMarketEngine";

import {
getMarketSentiment
} from "../../src/utils/marketSentiment";

import {
generatePortfolioAlerts
} from "../../src/utils/portfolioAlerts";

import {
calculatePortfolioScore
} from "../../src/utils/portfolioScore";
import {
generateCoachRecommendation
} from "../../src/utils/coachRecommendation";

import {
generateCoachActions
} from "../../src/utils/coachActions";
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
  const [hasStatement, setHasStatement] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState(null);
  const [showHealth, setShowHealth] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [setupReady, setSetupReady] = useState(false);
  const [setupChecks, setSetupChecks] = useState({
  profile: false,
  broker: false,
  portfolio: false
});

  const [transactionsUploaded, setTransactionsUploaded] = useState(false);
  const [transactions, setTransactions] = useState([]);
const [
coachDecision,
setCoachDecision
] = useState(null);

const [
coachActions,
setCoachActions
] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);


    const profileRaw = await AsyncStorage.getItem("gatecepInvestorProfile");
    const brokerRaw = await AsyncStorage.getItem("gatecepBrokerProfile");
    const portfolioRaw = await AsyncStorage.getItem("gatecepManualPortfolio");
    const watchlistRaw=
await AsyncStorage.getItem(
"gatecepWatchlist"
);

const watchlist=
watchlistRaw
?JSON.parse(watchlistRaw)
:[];

setSetupChecks({
  profile: !!profileRaw,
  broker: !!brokerRaw,
  portfolio: !!portfolioRaw
});

if (
  setupReady &&
  (!setupChecks.profile || !setupChecks.broker || !setupChecks.portfolio)
) {

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.subtitle}>
        Complete setup before portfolio analysis becomes available.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Setup Checklist</Text>

        <ChecklistItem done={setupChecks.profile} label="Investor Profile" />
        <ChecklistItem done={setupChecks.broker} label="Broker Profile" />
        <ChecklistItem done={setupChecks.portfolio} label="Portfolio Setup" />
      </View>

      <Pressable
        style={styles.primary}
        onPress={() => router.replace("/investor-home")}
      >
        <Text style={styles.primaryText}>Return Home</Text>
      </Pressable>
    </ScrollView>
  );
}

setSetupReady(true);

    const raw = await AsyncStorage.getItem("gatecepManualPortfolio");
    const cashRaw =
      (await AsyncStorage.getItem("gatecepAvailableCash")) ||
      (await AsyncStorage.getItem("gatecepTradingSpace"));
    const statementRaw = await AsyncStorage.getItem("gatecepStatementUploaded");

    const txUploadedRaw = await AsyncStorage.getItem("gatecepTransactionsUploaded");
const txRaw = await AsyncStorage.getItem("gatecepTransactionHistory");

setTransactionsUploaded(txUploadedRaw === "true");

if (txRaw) {
  setTransactions(JSON.parse(txRaw));
}

    if (raw) setHoldings(JSON.parse(raw));

    if (cashRaw) {
      const parsed = Number(cashRaw);
      if (Number.isFinite(parsed)) setCash(parsed);
    }

    setHasStatement(statementRaw === "true");
    setLastUpdated(new Date().toLocaleString());
    setLoading(false);
  }

  const sectorRows = useMemo(() => {
    const sectors = {};

    holdings.forEach((h) => {
      const sector = h.sector || "Unknown";
      const value = Number(h.marketValue || h.value || 0);
      const profitLoss = Number(h.profitLoss || 0);

      if (!sectors[sector]) {
        sectors[sector] = {
          sector,
          totalValue: 0,
          profitLoss: 0,
          securities: []
        };
      }

      sectors[sector].totalValue += value;
      sectors[sector].profitLoss += profitLoss;
      sectors[sector].securities.push(h);
    });

    const total = Object.values(sectors).reduce(
      (sum, s) => sum + Number(s.totalValue || 0),
      0
    );

    return Object.values(sectors)
      .map((s) => ({
        ...s,
        weight: total > 0 ? (Number(s.totalValue || 0) / total) * 100 : 0
      }))
      .sort((a, b) => Number(b.totalValue || 0) - Number(a.totalValue || 0));
  }, [holdings]);

  const currentValue = holdings.reduce(
    (sum, h) => sum + Number(h.marketValue || h.value || 0),
    0
  );

  const netGainLoss = holdings.reduce(
    (sum, h) => sum + Number(h.profitLoss || 0),
    0
  );

  const investedValue = currentValue - netGainLoss;
  const gainLossPct = investedValue > 0 ? (netGainLoss / investedValue) * 100 : 0;
  const largest = sectorRows[0];

  const risk =
    Number(largest?.weight || 0) >= 35
      ? "HIGH_RISK"
      : Number(largest?.weight || 0) >= 30
      ? "MODERATE"
      : "BALANCED";

  const diversification =
    sectorRows.length >= 5
      ? "GOOD"
      : sectorRows.length >= 3
      ? "MODERATE"
      : "CONCENTRATED";

  const health = Math.max(
    0,
    Math.min(
      100,
      40 +
        sectorRows.length * 6 +
        (netGainLoss >= 0 ? 15 : -10) -
        (risk === "HIGH_RISK" ? 15 : 5)
    )
  );

  const coachSummary = buildCoachSummary();
  const recommendations = buildRecommendations();

  function buildCoachSummary() {
    const largestName = largest?.sector || "N/A";
    const largestWeight = Number(largest?.weight || 0).toFixed(1);

    const lowSectors = sectorRows
      .filter((s) => Number(s.weight || 0) < 5)
      .map((s) => s.sector);

    const concentration =
      Number(largest?.weight || 0) >= 35
        ? "high"
        : Number(largest?.weight || 0) >= 30
        ? "moderate"
        : "balanced";

    const cashMessage = !hasStatement
      ? "Statement upload is required before Coach G can evaluate available cash or trading space."
      : cash <= 1000
      ? "Available cash is limited, so Coach G will prioritize future deposits or new investment amounts."
      : "Available cash can support allocation changes while keeping a cash reserve.";

    return {
      largestName,
      largestWeight,
      concentration,
      cashMessage,
      lowSectors
    };
  }

function ChecklistItem({ done, label }) {
  return (
    <View style={styles.checkRow}>
      <Text style={styles.checkLabel}>{label}</Text>
      <Text style={done ? styles.checkDone : styles.checkMissing}>
        {done ? "COMPLETE" : "MISSING"}
      </Text>
    </View>
  );
}

  function buildRecommendations() {
    const recs = [];

    if (largest?.weight > 30) {
      recs.push(
        `Largest exposure is ${largest.sector}. Avoid adding more unless it directly supports your strategy.`
      );
    }

    if (!hasStatement) {
      recs.push("Statement upload is required to calculate available cash and trading space.");
    } else if (cash < 500) {
      recs.push(
        `Available cash is low (KES ${money(cash)}). Coach G recommends preserving liquidity or waiting for future deposits.`
      );
    } else if (cash < 5000) {
      recs.push(
        "Available cash can support small diversification moves without significantly increasing risk."
      );
    } else {
      recs.push(
        "Available cash can support meaningful portfolio adjustments while maintaining reserves."
      );
    }

    const underweight = sectorRows
      .filter((s) => Number(s.weight || 0) < 10 && s.sector !== largest?.sector)
      .sort((a, b) => a.weight - b.weight)
      .slice(0, 3);

    if (underweight.length > 0) {
      recs.push(
        `Underweight sectors detected: ${underweight
          .map((x) => x.sector)
          .join(", ")}. New capital should strengthen these areas.`
      );
    }

    if (recs.length === 0) {
      recs.push(
        "Portfolio allocation appears balanced. Future investments should maintain diversification and avoid overconcentration."
      );
    }

    return recs;
  }

  async function openCoach() {
    await AsyncStorage.setItem(
      "gatecepCoachContext",
      JSON.stringify({
        largestSector: largest?.sector,
        risk,
        cash,
        health,
        recommendations,
        timestamp: new Date().toISOString()
      })
    );

    router.push("/coach");
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#67e8f9" />
        <Text style={styles.loading}>Loading Dashboard...</Text>
      </View>
    );
  }

function buildBehaviorInsights() {
  if (!transactionsUploaded || !transactions.length) {
    return [
      "Upload transaction history so Coach G can analyze buying and selling behavior."
    ];
  }

  const buys = transactions.filter((t) => String(t.side || "").toUpperCase() === "BUY");
  const sells = transactions.filter((t) => String(t.side || "").toUpperCase() === "SELL");

  const totalValue = transactions.reduce(
    (sum, t) => sum + Number(t.value || 0),
    0
  );

  const avgTrade =
    transactions.length > 0
      ? totalValue / transactions.length
      : 0;

  const buyPct =
    transactions.length > 0
      ? (buys.length / transactions.length) * 100
      : 0;

  const sellPct =
    transactions.length > 0
      ? (sells.length / transactions.length) * 100
      : 0;

  const symbolCount = {};

  buys.forEach((t) => {
    const symbol = String(t.symbol || "").toUpperCase();

    if (symbol) {
      symbolCount[symbol] = (symbolCount[symbol] || 0) + 1;
    }
  });

  const repeatedBuys = Object.entries(symbolCount)
    .filter(([, count]) => count >= 2)
    .map(([symbol]) => symbol);

  const buyFrequency = {};

buys.forEach((t) => {
  const symbol = String(t.symbol || "").toUpperCase();

  if (!buyFrequency[symbol]) {
    buyFrequency[symbol] = [];
  }

  buyFrequency[symbol].push(t);
});

const averagingDown = [];

Object.entries(buyFrequency).forEach(([symbol, trades]) => {
  if (trades.length < 2) return;

  const prices = trades
    .map((x) => Number(x.price || 0))
    .filter((x) => x > 0);

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] < prices[i - 1]) {
      averagingDown.push(symbol);
      break;
    }
  }
});

const concentrationRiskSymbols =
  repeatedBuys.filter((x) => symbolCount[x] >= 3);

const overTrading =
  transactions.length >= 15;

  const insights = [];

  insights.push(
    `Coach G reviewed ${transactions.length} transactions (${buys.length} buys / ${sells.length} sells).`
  );

  insights.push(
    `Average trade size: KES ${money(avgTrade)}.`
  );

  if (repeatedBuys.length > 0) {
    insights.push(
      `Repeated accumulation detected in ${repeatedBuys.join(", ")}. Coach G will monitor whether this is disciplined accumulation or concentration risk.`
    );
  }

  if (sellPct > buyPct) {
    insights.push(
      "Selling activity exceeds buying activity. Coach G will watch for emotional exits or short holding periods."
    );
  }

  if (transactions.length >= 10) {
    insights.push(
      "Sufficient transaction history exists for stronger behavior-based coaching."
    );
  } else {
    insights.push(
      "More transaction history will improve Coach G accuracy."
    );
  }

  if (avgTrade > 0 && avgTrade < 3000) {
    insights.push(
      "Average trade size is relatively small. Frequent small trades may increase costs and behavioral risk."
    );
  }

  if (avgTrade >= 10000) {
    insights.push(
      "Average trade size is meaningful. Coach G will prioritize allocation discipline and sector concentration control."
    );
  }

if (averagingDown.length > 0) {
  insights.push(
    `Possible averaging down behavior detected in ${averagingDown.join(", ")}. Coach G will monitor whether lower prices are creating opportunity or concentration risk.`
  );
}

if (concentrationRiskSymbols.length > 0) {
  insights.push(
    `Heavy repeat buying detected in ${concentrationRiskSymbols.join(", ")} which may increase sector concentration risk.`
  );
}

if (overTrading) {
  insights.push(
    "Trading frequency appears elevated. Coach G will monitor for overtrading behavior."
  );
}

if (
  risk === "HIGH_RISK" &&
  concentrationRiskSymbols.length > 0
) {
  insights.push(
    "Transaction behavior is reinforcing an already concentrated portfolio structure."
  );
}

  return insights;
}

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable style={styles.icon} onPress={() => router.push("/menu")}>
          <Text style={styles.iconText}>☰</Text>
        </Pressable>

        <Pressable
 style={styles.secondary}
 onPress={() => router.push("/investor-home")}
>
 <Text style={styles.secondaryText}>
   Home
 </Text>
</Pressable>

        <Text style={styles.title}>Dashboard</Text>

        <View style={styles.icon}>
          <Text>🔔</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Coach G portfolio overview</Text>
      <Text style={styles.timestamp}>Updated {lastUpdated}</Text>

      <View style={styles.summaryOuter}>
        <View style={styles.summaryTopPlain}>
          <PlainMetric label="Invested Value" value={`KES ${money(investedValue)}`} color="white" />
          <PlainMetric label="Current Value" value={`KES ${money(currentValue)}`} color="#67e8f9" />

          <PlainMetric
            label="Net Gain/Loss"
            value={`KES ${money(netGainLoss)} (${gainLossPct.toFixed(2)}%)`}
            color={netGainLoss >= 0 ? "#86efac" : "#fca5a5"}
          />

          <PlainMetric
            label="Available Cash"
            value={hasStatement ? `KES ${money(cash)}` : "Statement Required"}
            color={hasStatement ? "#86efac" : "#fbbf24"}
            sub={hasStatement ? "Broker trading space" : "Upload statement"}
          />
        </View>

        <View style={styles.summaryRiskRow}>
          <Metric
            label="Risk"
            value={risk}
            color={risk === "HIGH_RISK" ? "#fca5a5" : "#86efac"}
          />

          <Metric label="Sectors" value={String(sectorRows.length)} color="#67e8f9" />
        </View>
      </View>

      <View style={styles.summaryBottom}>
        <Metric label="Diversification" value={diversification} color="#67e8f9" highlight="cyan" />

        <Metric
          label="Largest Sector"
          value={
            largest
              ? `${largest.sector} (${Number(largest.weight || 0).toFixed(2)}%)`
              : "N/A"
          }
          color="#c084fc"
          highlight="purple"
        />
      </View>

      <View style={styles.coachSummary}>
        <Text style={styles.cardTitle}>Coach G Summary</Text>
         <View style={styles.card}>

<Text style={styles.cardTitle}>
AI Portfolio Score
</Text>

<Text style={{
 color:"#86efac",
 fontSize:48,
 fontWeight:"900"
}}>
{health >= 90
 ? "A+"
 : health >= 80
 ? "A"
 : health >= 70
 ? "B"
 : health >= 60
 ? "C"
 : "D"}
</Text>

<Text style={styles.body}>
Score: {health}/100
</Text>

</View>

        <Text style={styles.body}>
          <Text style={styles.highlight}>{coachSummary.largestName}</Text> is the largest exposure at{" "}
          <Text style={styles.highlight}>{coachSummary.largestWeight}%</Text>, creating a{" "}
          <Text style={styles.highlight}>{coachSummary.concentration}</Text> concentration profile.{" "}
          {coachSummary.cashMessage}
        </Text>

        {coachSummary.lowSectors.length > 0 ? (
          <Text style={styles.body}>
            Underrepresented sectors include{" "}
            <Text style={styles.highlight}>{coachSummary.lowSectors.join(", ")}</Text>. Future
            allocations should improve diversification.
          </Text>
        ) : (
          <Text style={styles.body}>
            Sector coverage is broad. Future allocations should maintain balance.
          </Text>
        )}
      </View>

{coachDecision && (

<View style={styles.card}>

<Text style={styles.cardTitle}>
Coach G Recommendation
</Text>

<Text style={{
fontSize:34,
fontWeight:"900",
color:
coachDecision.recommendation==="BUY"
?"#86efac"
:
coachDecision.recommendation==="REDUCE"
?"#fca5a5"
:"#67e8f9"
}}>

{coachDecision.recommendation}

</Text>

<Text style={styles.body}>
Confidence:
 {coachDecision.confidence}%
</Text>

<Text style={styles.body}>
Suggested Amount:
 KES {money(
 coachDecision.suggestedAmount
 )}
</Text>

{coachDecision.reason.map(
(r,i)=>(
<Text
key={i}
style={styles.body}
>

• {r}

</Text>
))
}

</View>

)}

<View style={{ marginTop: 20 }}>
  {coachActions.map((a) => (
    <Pressable
      key={a.label}
      style={styles.quickCard}
      onPress={() => router.push(a.route)}
    >
      <Text style={styles.quickTitle}>{a.label}</Text>
    </Pressable>
  ))}
</View>

<View style={styles.card}>

<Text style={styles.cardTitle}>
Coach G Alerts
</Text>

{risk==="HIGH_RISK" && (
<Text style={styles.body}>
⚠ Portfolio concentration risk detected
</Text>
)}

{cash<1000 && (
<Text style={styles.body}>
⚠ Low cash reserves
</Text>
)}

{netGainLoss>=0 && (
<Text style={styles.body}>
✓ Portfolio health looks stable
</Text>
)}

</View>

      <Text style={styles.section}>Sector Allocation</Text>

      <View style={styles.sectorContainer}>
        <View style={styles.chartPanel}>
          <SectorDonut data={sectorRows} total={currentValue} onSelect={setSelectedSector} />
        </View>

        <View style={styles.tablePanel}>
          <View style={styles.tableHeader}>
            <Text style={styles.sectorHeader}>Sector</Text>
            <Text style={styles.valueHeader}>Value</Text>
            <Text style={styles.weightHeader}>Weight</Text>
          </View>

          {sectorRows.map((s, index) => (
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

                  <Text style={s.profitLoss >= 0 ? styles.greenText : styles.redText}>
                    {s.profitLoss >= 0 ? "▲" : "▼"} {s.sector}
                  </Text>
                </View>
              </View>

              <Text style={styles.valueCol}>KES {money(s.totalValue)}</Text>
              <Text style={styles.weightCol}>{Number(s.weight || 0).toFixed(2)}%</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coach G Recommendations</Text>

        <View style={{ marginTop: 10 }}>
          {recommendations.map((r, index) => (
            <Text key={index} style={styles.body}>
              • {r}
            </Text>
          ))}
        </View>
      </View>

<View style={styles.card}>
  <Text style={styles.cardTitle}>Coach G Behavior Insights</Text>

  {buildBehaviorInsights().map((item, index) => (
    <Text key={index} style={styles.body}>
      • {item}
    </Text>
  ))}
</View>

      <Pressable style={styles.healthCard} onPress={() => setShowHealth(!showHealth)}>
        <View>
          <Text style={styles.metricLabel}>Portfolio Health</Text>
          <Text style={styles.health}>{health}/100</Text>
          <Text style={styles.smallHint}>Tap for details</Text>
        </View>

        {showHealth && (
          <View style={{ flex: 1 }}>
            <HealthRow label="Diversification" value={`+${Math.min(30, sectorRows.length * 4)}`} positive />
            <HealthRow label="Cash Position" value={`+${cash > 1000 ? 10 : 5}`} positive />
            <HealthRow label="Risk Exposure" value={`-${risk === "HIGH_RISK" ? 20 : 10}`} />
            <HealthRow
              label="Profitability"
              value={netGainLoss >= 0 ? "+15" : "-10"}
              positive={netGainLoss >= 0}
            />
          </View>
        )}

      </Pressable>
    
<Pressable style={styles.primary} onPress={openCoach}>
  <Text style={styles.primaryText}>Simulate Coach G Recommendations</Text>
</Pressable>

<View style={styles.card}>
  <Text style={styles.cardTitle}>Quick Actions</Text>

  <Pressable
    style={styles.primary}
    onPress={() => router.push("/trade")}
  >
    <Text style={styles.primaryText}>Buy</Text>
  </Pressable>

  <Pressable
    style={styles.secondary}
    onPress={() => router.push("/trade")}
  >
    <Text style={styles.secondaryText}>Sell</Text>
  </Pressable>

  <Pressable
    style={styles.secondary}
    onPress={() => router.push("/funds")}
  >
    <Text style={styles.secondaryText}>Deposit Funds</Text>
  </Pressable>

  <Pressable
    style={styles.secondary}
    onPress={() => router.push("/broker-profile")}
  >
    <Text style={styles.secondaryText}>Connect Broker</Text>
  </Pressable>

  <Pressable
    style={styles.secondary}
    onPress={() => router.push("/coach")}
  >
    <Text style={styles.secondaryText}>Open Coach G Insights</Text>
  </Pressable>
</View>

<SectorModal sector={selectedSector} onClose={() => setSelectedSector(null)} />
</ScrollView>
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

function Metric({ label, value, color, sub, highlight }) {
  return (
    <View
      style={[
        styles.metric,
        highlight === "cyan" && styles.metricCyan,
        highlight === "purple" && styles.metricPurple
      ]}
    >
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
    </View>
  );
}

function HealthRow({ label, value, positive }) {
  return (
    <View style={styles.healthRow}>
      <Text style={styles.white}>{label}</Text>
      <Text style={positive ? styles.greenText : styles.redText}>{value}</Text>
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
                {sector.securities.length} securities • KES {money(sector.totalValue)}
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

                  <Text style={Number(sec.profitLoss || 0) >= 0 ? styles.greenText : styles.redText}>
                    KES {money(sec.profitLoss)}
                  </Text>
                </View>

                <View style={styles.compactMetrics}>
                  <InfoBox label="Qty" value={Number(sec.quantity || 0).toLocaleString()} />
                  <InfoBox label="Price" value={`KES ${money(sec.marketPrice || sec.price)}`} />
                  <InfoBox label="Value" value={`KES ${money(sec.marketValue || sec.value)}`} />
                  <InfoBox
                    label="Return"
                    value={`${Number(sec.changePct || 0).toFixed(2)}%`}
                    positive={Number(sec.changePct || 0) >= 0}
                  />
                </View>
              </View>

            ))}
<FloatingCoachG />
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
            const start = data.slice(0, index).reduce((sum, x) => sum + x.weight, 0);
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
    width: "47%",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1
  },
  metricCyan: {
    backgroundColor: "rgba(6,182,212,.08)",
    borderColor: "rgba(6,182,212,.35)"
  },
  metricPurple: {
    backgroundColor: "rgba(147,51,234,.12)",
    borderColor: "rgba(147,51,234,.35)"
  },
  metricLabel: { color: "#94a3b8" },
  metricValue: { marginTop: 8, fontWeight: "900" },
  metricSub: { color: "#94a3b8", marginTop: 4, fontSize: 11 },

  coachSummary: {
    marginTop: 16,
    backgroundColor: "rgba(147,51,234,.13)",
    borderColor: "rgba(147,51,234,.35)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },
  section: {
    marginTop: 24,
    fontSize: 24,
    fontWeight: "900",
    color: "white"
  },
  card: {
    marginTop: 16,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    padding: 18,
    borderRadius: 20
  },
  white: { color: "white" },
  cardTitle: { color: "#67e8f9", fontWeight: "900" },
  body: { marginTop: 10, color: "#cbd5e1", lineHeight: 21 },
  highlight: { color: "#c084fc", fontWeight: "900" },
  greenText: { color: "#86efac", fontWeight: "900" },
  redText: { color: "#fca5a5", fontWeight: "900" },

  sectorContainer: {
    marginTop: 16,
    flexDirection: "column",
    gap: 18
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

  healthCard: {
    marginTop: 18,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    gap: 24
  },
  health: { color: "#67e8f9", fontSize: 32, fontWeight: "900", marginTop: 6 },
  smallHint: { color: "#94a3b8", fontSize: 11, marginTop: 6 },
  healthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4
  },

  primary: {
    marginTop: 20,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 16
  },
  primaryText: { color: "white", textAlign: "center", fontWeight: "900" },

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

checkRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: 14,
  borderBottomColor: "#1e293b",
  borderBottomWidth: 1
},

checkLabel: {
  color: "white",
  fontWeight: "800"
},

checkDone: {
  color: "#86efac",
  fontWeight: "900"
},

checkMissing: {
  color: "#fca5a5",
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