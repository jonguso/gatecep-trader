import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { Page } from "../../src/components/ProTradingUI";
import BrokerHeader from "../../src/components/BrokerHeader";
import { getUnifiedPortfolio } from "../../src/services/unifiedPortfolioApi";
import { kes } from "../../src/utils/money";

export default function Portfolio() {
  const [payload, setPayload] = useState(null);
  const [view, setView] = useState("Holdings");

  useEffect(() => {
    getUnifiedPortfolio("u1").then(setPayload).catch(() => {});
  }, []);

  const totals = payload?.totals || {};
  const holdings = payload?.consolidatedHoldings || [];
  const sectors = payload?.sectorExposure || [];
  const brokers = payload?.brokerExposure || [];

  const pnl = Number(totals.unrealizedPnl || 0);

  return (
    <Page>
      <BrokerHeader title="Portfolio" subtitle="Unified broker-mirrored view" />

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <Text style={styles.label}>TOTAL CURRENT VALUE</Text>
          <Text style={styles.big}>{kes(totals.currentValue || 0)}</Text>
          <Text style={styles.line}>Invested Value: {kes(totals.investedValue || 0)}</Text>
          <Text style={[styles.line, { color: pnl >= 0 ? "#22C55E" : "#EF4444" }]}>
            Unrealized P&L: {kes(pnl)}
          </Text>
          <Text style={styles.line}>Available Cash: {kes(totals.availableCash || 0)}</Text>
          <Text style={styles.line}>Total Wealth: {kes(totals.totalWealth || 0)}</Text>
        </View>

        <View style={styles.coach}>
          <Text style={styles.coachTitle}>Coach G Portfolio Risk</Text>
          <View style={styles.riskRow}>
            <Text style={styles.riskScore}>{payload?.coachG?.riskScore || 0}</Text>
            <Text style={styles.riskLevel}>{payload?.coachG?.riskLevel || "LOW"}</Text>
          </View>
          <Text style={styles.coachSummary}>{payload?.coachG?.summary || "Loading portfolio intelligence..."}</Text>
          {(payload?.coachG?.insights || []).map((item, idx) => (
            <Text key={idx} style={styles.insight}>• {item}</Text>
          ))}
        </View>

        <View style={styles.tabs}>
          {["Holdings", "Brokers", "Sectors"].map(x => (
            <Pressable key={x} onPress={() => setView(x)} style={[styles.tab, view === x && styles.active]}>
              <Text style={[styles.tabText, view === x && styles.activeText]}>{x}</Text>
            </Pressable>
          ))}
        </View>

        {view === "Holdings" && (
          <View>
            <Text style={styles.section}>Consolidated Holdings</Text>
            {holdings.map(h => (
              <View key={h.symbol} style={styles.card}>
                <View style={styles.top}>
                  <View>
                    <Text style={styles.symbol}>{h.symbol}</Text>
                    <Text style={styles.name}>{h.name}</Text>
                  </View>
                  <Text style={[styles.pnl, { color: h.unrealizedPnl >= 0 ? "#22C55E" : "#EF4444" }]}>
                    {kes(h.unrealizedPnl)}
                  </Text>
                </View>

                <View style={styles.grid}>
                  <Text style={styles.cell}>Total Qty: {h.totalQty}</Text>
                  <Text style={styles.cell}>Avg Cost: {Number(h.avgCost || 0).toFixed(2)}</Text>
                  <Text style={styles.cell}>Market: {Number(h.marketPrice || 0).toFixed(2)}</Text>
                  <Text style={styles.cell}>Value: {kes(h.marketValue)}</Text>
                </View>

                <Text style={styles.breakdownTitle}>Broker breakdown</Text>
                {(h.brokerBreakdown || []).map((b, idx) => (
                  <Text key={idx} style={styles.breakdown}>
                    {b.brokerName}: {b.qty} shares · {kes(b.marketValue)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {view === "Brokers" && (
          <View>
            <Text style={styles.section}>Broker Exposure</Text>
            {brokers.map(b => (
              <View key={b.brokerId} style={styles.card}>
                <View style={styles.top}>
                  <Text style={styles.symbol}>{b.brokerName}</Text>
                  <Text style={styles.percent}>{b.allocationPct}%</Text>
                </View>
                <Text style={styles.name}>Account: {b.accountNumber}</Text>
                <Text style={styles.line}>Market Value: {kes(b.marketValue)}</Text>
                <Text style={styles.line}>Holdings: {b.holdingsCount}</Text>
              </View>
            ))}
          </View>
        )}

        {view === "Sectors" && (
          <View>
            <Text style={styles.section}>Sector Allocation</Text>
            {sectors.map(s => (
              <View key={s.sector} style={styles.card}>
                <View style={styles.top}>
                  <Text style={styles.symbol}>{s.sector}</Text>
                  <Text style={styles.percent}>{s.allocationPct}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.min(100, s.allocationPct)}%` }]} />
                </View>
                <Text style={styles.line}>Market Value: {kes(s.marketValue)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  body:{backgroundColor:"#08111F",padding:16},
  summary:{backgroundColor:"#111D35",borderRadius:18,padding:18,marginBottom:14,borderWidth:1,borderColor:"rgba(148,163,184,.22)"},
  label:{color:"#94A3B8",fontSize:11,fontWeight:"900"},
  big:{color:"#fff",fontSize:30,fontWeight:"900",marginTop:6},
  line:{color:"#CBD5E1",fontWeight:"800",marginTop:7},
  coach:{backgroundColor:"#16233F",borderRadius:18,padding:16,marginBottom:14,borderWidth:1,borderColor:"rgba(34,211,238,.25)"},
  coachTitle:{color:"#fff",fontSize:18,fontWeight:"900"},
  riskRow:{flexDirection:"row",alignItems:"baseline",gap:10,marginTop:8},
  riskScore:{color:"#22C55E",fontSize:34,fontWeight:"900"},
  riskLevel:{color:"#FBBF24",fontSize:18,fontWeight:"900"},
  coachSummary:{color:"#CBD5E1",marginTop:8,lineHeight:20},
  insight:{color:"#CBD5E1",marginTop:8},
  tabs:{flexDirection:"row",gap:10,marginBottom:14},
  tab:{flex:1,borderWidth:1,borderColor:"#334155",borderRadius:10,paddingVertical:10,alignItems:"center"},
  active:{backgroundColor:"#0B5CFF",borderColor:"#0B5CFF"},
  tabText:{color:"#CBD5E1",fontWeight:"900"},
  activeText:{color:"#fff"},
  section:{color:"#fff",fontSize:18,fontWeight:"900",marginBottom:10},
  card:{backgroundColor:"#111D35",borderRadius:14,padding:14,marginBottom:12,borderWidth:1,borderColor:"rgba(148,163,184,.22)"},
  top:{flexDirection:"row",justifyContent:"space-between",gap:10},
  symbol:{color:"#fff",fontSize:18,fontWeight:"900",flexShrink:1},
  name:{color:"#94A3B8",marginTop:3},
  pnl:{fontWeight:"900"},
  percent:{color:"#38BDF8",fontSize:18,fontWeight:"900"},
  grid:{flexDirection:"row",flexWrap:"wrap",marginTop:12},
  cell:{width:"50%",color:"#CBD5E1",paddingVertical:4,fontWeight:"700"},
  breakdownTitle:{color:"#38BDF8",fontWeight:"900",marginTop:12},
  breakdown:{color:"#CBD5E1",marginTop:5},
  barTrack:{height:10,backgroundColor:"#24344F",borderRadius:6,marginTop:12,overflow:"hidden"},
  barFill:{height:10,backgroundColor:"#22C55E",borderRadius:6}
});
