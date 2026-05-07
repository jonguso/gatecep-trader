import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { Page } from "../../src/components/ProTradingUI";
import BrokerHeader from "../../src/components/BrokerHeader";
import { getBrokerPortfolio } from "../../src/services/brokerMirrorApi";
import { kes } from "../../src/utils/money";

export default function Portfolio() {
  const [payload, setPayload] = useState(null);
  const [selectedBroker, setSelectedBroker] = useState("ALL");

  const load = async () => {
    const data = await getBrokerPortfolio("u1");
    setPayload(data);
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const brokerIds = useMemo(() => {
    const ids = new Set((payload?.holdings || []).map(h => h.brokerId));
    return ["ALL", ...Array.from(ids)];
  }, [payload]);

  const holdings = useMemo(() => {
    const rows = payload?.holdings || [];
    if (selectedBroker === "ALL") return rows;
    return rows.filter(h => h.brokerId === selectedBroker);
  }, [payload, selectedBroker]);

  const currentValue = holdings.reduce((s,h)=>s+Number(h.marketValue||0),0);
  const investedValue = holdings.reduce((s,h)=>s+Number(h.investedValue||0),0);
  const pnl = currentValue - investedValue;

  return (
    <Page>
      <BrokerHeader title="Portfolio" subtitle="Broker mirrored holdings" />
      <ScrollView style={styles.body}>
        <View style={styles.filterRow}>
          {brokerIds.map(id => (
            <Pressable key={id} onPress={() => setSelectedBroker(id)} style={[styles.filter, selectedBroker === id && styles.filterActive]}>
              <Text style={[styles.filterText, selectedBroker === id && styles.filterTextActive]}>{id}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.label}>CURRENT VALUE</Text>
          <Text style={styles.big}>{kes(currentValue)}</Text>
          <Text style={styles.rowText}>Invested Value: {kes(investedValue)}</Text>
          <Text style={[styles.rowText, { color: pnl >= 0 ? "#22C55E" : "#EF4444" }]}>Unrealized P&L: {kes(pnl)}</Text>
        </View>

        <Text style={styles.section}>Broker Holdings</Text>

        {holdings.map((h, idx) => (
          <View key={`${h.brokerId}-${h.symbol}-${idx}`} style={styles.card}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.symbol}>{h.symbol}</Text>
                <Text style={styles.name}>{h.name}</Text>
              </View>
              <Text style={styles.broker}>{h.brokerName}</Text>
            </View>
            <View style={styles.grid}>
              <Text style={styles.cell}>Qty: {h.qty}</Text>
              <Text style={styles.cell}>Avg: {Number(h.avgPrice).toFixed(2)}</Text>
              <Text style={styles.cell}>Mkt: {Number(h.marketPrice).toFixed(2)}</Text>
              <Text style={styles.cell}>Value: {kes(h.marketValue)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  body:{backgroundColor:"#08111F",padding:16},
  filterRow:{flexDirection:"row",gap:8,marginBottom:14,flexWrap:"wrap"},
  filter:{borderWidth:1,borderColor:"#334155",paddingHorizontal:12,paddingVertical:8,borderRadius:10},
  filterActive:{backgroundColor:"#0B5CFF",borderColor:"#0B5CFF"},
  filterText:{color:"#CBD5E1",fontWeight:"900"},
  filterTextActive:{color:"#fff"},
  summary:{backgroundColor:"#111D35",borderRadius:16,padding:18,marginBottom:18},
  label:{color:"#94A3B8",fontSize:11,fontWeight:"900"},
  big:{color:"#fff",fontSize:30,fontWeight:"900",marginTop:6},
  rowText:{color:"#CBD5E1",marginTop:8,fontWeight:"800"},
  section:{color:"#fff",fontSize:18,fontWeight:"900",marginBottom:10},
  card:{backgroundColor:"#111D35",borderRadius:14,padding:14,marginBottom:12,borderWidth:1,borderColor:"rgba(148,163,184,.22)"},
  cardTop:{flexDirection:"row",justifyContent:"space-between",gap:10},
  symbol:{color:"#fff",fontSize:18,fontWeight:"900"},
  name:{color:"#94A3B8",marginTop:3},
  broker:{color:"#38BDF8",fontWeight:"900"},
  grid:{flexDirection:"row",flexWrap:"wrap",marginTop:12},
  cell:{width:"50%",color:"#CBD5E1",paddingVertical:4,fontWeight:"700"}
});
