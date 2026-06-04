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

const COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899"];

export default function Dashboard() {
  const [holdings, setHoldings] = useState([]);
  const [cash, setCash] = useState(112.75);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showHealth, setShowHealth] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    load();
  }, []);


  async function load() {
    setLoading(true);

    const raw = await AsyncStorage.getItem("gatecepManualPortfolio");
    const cashRaw =
      (await AsyncStorage.getItem("gatecepAvailableCash")) ||
      (await AsyncStorage.getItem("gatecepTradingSpace"));

    if (raw) setHoldings(JSON.parse(raw));

    if (cashRaw) {
      const parsed = Number(cashRaw);
      if (Number.isFinite(parsed)) setCash(parsed);
    }

    setLoading(false);

setLastUpdated(new Date().toLocaleString());
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

    const cashMessage =
      cash <= 1000
        ? "Available cash is limited, so Coach G will prioritize future deposits or new investment amounts."
        : "Available cash can support small allocation changes while keeping a cash reserve.";

    return {
      largestName,
      largestWeight,
      concentration,
      cashMessage,
      lowSectors
    };
  }

  function buildRecommendations() {
    const recs = [];

    if (largest?.weight > 30) {
      recs.push(
        `Largest exposure is ${largest.sector}. Avoid adding more unless it directly supports your strategy.`
      );
    }

    if (cash < 500) {
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

    if (largest?.sector === "Banking" && largest.weight > 30) {
      recs.push(
        "Coach G will avoid recommending additional banking allocations unless your selected goal specifically requires it."
      );
    }

    if (recs.length === 0) {
      recs.push(
        "Portfolio allocation appears balanced. Future investments should maintain diversification and avoid overconcentration."
      );
    }

    return recs;
  }

  const coach = buildCoachSummary();
  const recommendations = buildRecommendations();

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

        <Pressable style={styles.icon}>
          <Text>🔔</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>Coach G portfolio overview</Text>

      <Text style={styles.timestamp}>
Updated {lastUpdated}
</Text>

      <View style={styles.summary}>
        <Metric label="Invested Value" value={`KES ${money(investedValue)}`} color="white" />
        <Metric label="Current Value" value={`KES ${money(currentValue)}`} color="#67e8f9" />
        <Metric
          label="Net Gain/Loss"
          value={`KES ${money(netGainLoss)} (${gainLossPct.toFixed(2)}%)`}
          color={netGainLoss >= 0 ? "#86efac" : "#fca5a5"}
        />
        <Metric
          label="Available Cash"
          value={`KES ${money(cash)}`}
          color="#86efac"
          sub="Broker trading space"
        />
        <Metric
          label="Risk"
          value={risk}
          color={risk === "HIGH_RISK" ? "#fca5a5" : "#86efac"}
        />
        <Metric label="Sectors" value={String(sectorRows.length)} color="#67e8f9" />
        <Metric label="Diversification" value={diversification} color="#67e8f9" />
        <Metric label="Largest Sector" value={largest?.sector || "N/A"} color="#c084fc" />
      </View>

      <View style={styles.coachSummary}>
        <Text style={styles.cardTitle}>Coach G Summary</Text>

        <Text style={styles.body}>
          <Text style={styles.highlight}>{coach.largestName}</Text> is the largest exposure at{" "}
          <Text style={styles.highlight}>{coach.largestWeight}%</Text>, creating a{" "}
          <Text style={styles.highlight}>{coach.concentration}</Text> concentration profile.{" "}
          {coach.cashMessage}
        </Text>

        {coach.lowSectors.length > 0 ? (
          <Text style={styles.body}>
            Underrepresented sectors include{" "}
            <Text style={styles.highlight}>{coach.lowSectors.join(", ")}</Text>. Future
            allocations should improve diversification before adding more to overweight sectors.
          </Text>
        ) : (
          <Text style={styles.body}>
            Sector coverage is broad. Future allocations should maintain balance and avoid
            increasing the largest exposure.
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

 <Pressable
  style={styles.healthCard}
  onPress={() => setShowHealth(!showHealth)}
>
  <View>
    <Text style={styles.metricLabel}>Portfolio Health</Text>
    <Text style={styles.health}>{health}/100</Text>
    <Text style={styles.smallHint}>Tap for details</Text>
  </View>

  {showHealth && (
    <View style={{ flex: 1 }}>
      <HealthRow
        label="Diversification"
        value={`+${Math.min(30, sectorRows.length * 4)}`}
        positive
      />

      <HealthRow
        label="Cash Position"
        value={`+${cash > 1000 ? 10 : 5}`}
        positive
      />

      <HealthRow
        label="Risk Exposure"
        value={`-${risk === "HIGH_RISK" ? 20 : 10}`}
      />

      <HealthRow
        label="Profitability"
        value={netGainLoss >= 0 ? "+15" : "-10"}
        positive={netGainLoss >= 0}
      />
    </View>
  )}

</Pressable>

<Pressable
  style={styles.primary}
  onPress={async () => {
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
  }}
>
  <Text style={styles.primaryText}>Simulate Coach G Recommendations</Text>
</Pressable>

      <SectorModal sector={selectedSector} onClose={() => setSelectedSector(null)} />
      <Simulator visible={showSimulator} onClose={() => setShowSimulator(false)} />
    </ScrollView>
  );
}

function Metric({ label, value, color, sub }) {
  return (
    <View style={styles.metric}>
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

<Modal
visible
transparent
animationType="fade"
>

<View style={styles.modalOverlay}>

<View style={styles.sectorPopup}>

<View style={styles.popupHeader}>

<View>

<Text style={styles.popupTitle}>
{sector.sector}
</Text>

<Text style={styles.popupSub}>

{sector.securities.length} securities •
 Total Value: KES {money(sector.totalValue)}

</Text>

</View>

<Pressable
style={styles.closeCircle}
onPress={onClose}
>

<Text style={{color:"white"}}>

✕

</Text>

</Pressable>

</View>


<View style={styles.popupTableHeader}>

<Text style={styles.popupCol1}>
Security
</Text>

<Text style={styles.popupCol2}>
Qty
</Text>

<Text style={styles.popupCol3}>
Market Value
</Text>

</View>


<ScrollView
style={{
maxHeight:340
}}
showsVerticalScrollIndicator
>

{

sector.securities.map(
(item,index)=>(

<View
key={`${item.symbol}-${index}`}
style={styles.popupRow}
>

<Text
style={styles.popupCol1Text}
>

{item.symbol}

</Text>

<Text
style={styles.popupCol2Text}
>

{item.quantity||0}

</Text>

<Text
style={styles.popupCol3Text}
>

KES {money(
item.marketValue||
item.value
)}

</Text>

</View>

))

}

</ScrollView>


<Pressable
style={styles.primary}
onPress={onClose}
>

<Text style={styles.primaryText}>
Close
</Text>

</Pressable>

</View>

</View>

</Modal>

)

}

function Simulator({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Coach Simulator</Text>
          <Text style={styles.body}>Simulation engine moved to Coach tab.</Text>

          <Pressable style={styles.primary} onPress={onClose}>
            <Text style={styles.primaryText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function SectorDonut({ data, total, onSelect }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={300} height={300}>
        <G x={150} y={150}>
          {data.map((item, index) => {
            const start = data.slice(0, index).reduce((sum, x) => sum + x.weight, 0);
            const end = start + item.weight;
            const labelAngle = ((start + end) / 2) * 3.6;
            const labelPos = polar(0, 0, 122, labelAngle);

            return (
              <G key={item.sector}>
                <Path
                  d={describeArc(0, 0, 110, 62, start * 3.6, end * 3.6)}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#020617"
                  strokeWidth={2}
                  onPress={() => onSelect(item)}
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

          <Circle cx={0} cy={0} r={62} fill="#020617" />

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
  summary: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metric: {
    width: "47%",
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#0f172a"
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
  primary: {
    marginTop: 20,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 16
  },
  primaryText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900"
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.75)",
    justifyContent: "center",
    padding: 18
  },
  modal: {
    backgroundColor: "#020617",
    padding: 18,
    borderRadius: 24
  },
  modalTitle: { fontSize: 24, fontWeight: "900", color: "white" },
  modalRow: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1
  },
  sectorContainer: {
    marginTop: 16,
    flexDirection: "row",
    gap: 18,
    alignItems: "stretch"
  },
  chartPanel: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    justifyContent: "center"
  },
  tablePanel: {
    flex: 1.2,
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
  sectorHeader: {
    flex: 1.4,
    color: "#94a3b8",
    fontSize: 12
  },
  valueHeader: {
    flex: 1,
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "right"
  },
  weightHeader: {
    flex: 0.7,
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "right"
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 12
  },
  sectorCol: { flex: 1.4 },
  valueCol: {
    flex: 1,
    color: "white",
    fontWeight: "900",
    textAlign: "right"
  },
  weightCol: {
    flex: 0.7,
    color: "white",
    fontWeight: "900",
    textAlign: "right"
  },
  sectorNameWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 8
  },
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
  health: {
    color: "#67e8f9",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 6
  },

smallHint: {
  color: "#94a3b8",
  fontSize: 11,
  marginTop: 6
},

miniOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,.45)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20
},

miniModal: {
  width: "92%",
  maxWidth: 560,
  backgroundColor: "#0f172a",
  borderColor: "#334155",
  borderWidth: 1,
  borderRadius: 24,
  padding: 18,
  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 20,
  elevation: 8
},

modalHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
},

closeCircle: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: "#1e293b",
  alignItems: "center",
  justifyContent: "center"
},

closeText: {
  color: "white",
  fontSize: 22,
  fontWeight: "900",
  lineHeight: 24
},

modalSub: {
  color: "#94a3b8",
  marginTop: 6
},

miniRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 12,
  borderBottomColor: "#1e293b",
  borderBottomWidth: 1
},

whiteBold: {
  color: "white",
  fontWeight: "900"
},

mutedSmall: {
  color: "#94a3b8",
  fontSize: 12,
  marginTop: 3
},

timestamp:{
 color:"#64748b",
 marginTop:6,
 fontSize:12
},

modalOverlay:{
flex:1,
backgroundColor:"rgba(0,0,0,.55)",
justifyContent:"center",
alignItems:"center",
padding:20
},

sectorPopup:{
width:"92%",
maxWidth:760,
backgroundColor:"#0f172a",
borderRadius:28,
padding:22,
borderColor:"#334155",
borderWidth:1
},

popupHeader:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginBottom:20
},

popupTitle:{
fontSize:24,
fontWeight:"900",
color:"white"
},

popupSub:{
color:"#94a3b8",
marginTop:6
},

closeCircle:{
width:40,
height:40,
borderRadius:20,
backgroundColor:"#1e293b",
justifyContent:"center",
alignItems:"center"
},

popupTableHeader:{
flexDirection:"row",
paddingBottom:12,
borderBottomColor:"#334155",
borderBottomWidth:1
},

popupRow:{
flexDirection:"row",
paddingVertical:14,
borderBottomColor:"#1e293b",
borderBottomWidth:1
},

popupCol1:{
flex:1.3,
color:"#cbd5e1"
},

popupCol2:{
width:90,
textAlign:"center",
color:"#cbd5e1"
},

popupCol3:{
width:160,
textAlign:"right",
color:"#cbd5e1"
},

popupCol1Text:{
flex:1.3,
color:"white",
fontWeight:"800"
},

popupCol2Text:{
width:90,
textAlign:"center",
color:"#cbd5e1"
},

popupCol3Text:{
width:160,
textAlign:"right",
fontWeight:"900",
color:"white"
},

  healthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4
  }
});