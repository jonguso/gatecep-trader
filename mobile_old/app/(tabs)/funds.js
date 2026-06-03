import { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Page } from "../../src/components/ProTradingUI";
import BrokerHeader from "../../src/components/BrokerHeader";
import { getBrokerFunds } from "../../src/services/brokerMirrorApi";
import { kes } from "../../src/utils/money";

export default function Funds() {
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    getBrokerFunds("u1").then(setPayload).catch(() => {});
  }, []);

  const totals = payload?.totals || {};

  return (
    <Page>
      <BrokerHeader title="Funds" subtitle="Broker mirrored balances" />
      <ScrollView style={styles.body}>
        <View style={styles.summary}>
          <Text style={styles.label}>TOTAL AVAILABLE CASH</Text>
          <Text style={styles.big}>{kes(totals.availableCash || 0)}</Text>
          <Text style={styles.rowText}>Ledger Balance: {kes(totals.ledgerBalance || 0)}</Text>
          <Text style={styles.rowText}>Pending Payments: {kes(totals.pendingPayments || 0)}</Text>
          <Text style={styles.rowText}>Pending Buy Orders: {kes(totals.pendingBuyOrders || 0)}</Text>
        </View>

        <Text style={styles.section}>Broker Cash Balances</Text>

        {(payload?.brokerFunds || []).map(f => (
          <View key={f.brokerId} style={styles.card}>
            <Text style={styles.broker}>{f.brokerName}</Text>
            <Text style={styles.account}>Account: {f.accountNumber}</Text>
            <Row label="Ledger Balance" value={f.ledgerBalance} />
            <Row label="Available Cash" value={f.availableCash} />
            <Row label="Pending Payments" value={f.pendingPayments} />
            <Row label="Pending Buy Orders" value={f.pendingBuyOrders} />
          </View>
        ))}
      </ScrollView>
    </Page>
  );
}

function Row({ label, value }) {
  return <View style={styles.line}><Text style={styles.lineLabel}>{label}</Text><Text style={styles.lineValue}>{kes(value || 0)}</Text></View>
}

const styles = StyleSheet.create({
  body:{backgroundColor:"#08111F",padding:16},
  summary:{backgroundColor:"#111D35",borderRadius:16,padding:18,marginBottom:18},
  label:{color:"#94A3B8",fontSize:11,fontWeight:"900"},
  big:{color:"#fff",fontSize:30,fontWeight:"900",marginTop:6},
  rowText:{color:"#CBD5E1",marginTop:8,fontWeight:"800"},
  section:{color:"#fff",fontSize:18,fontWeight:"900",marginBottom:10},
  card:{backgroundColor:"#111D35",borderRadius:14,padding:14,marginBottom:12,borderWidth:1,borderColor:"rgba(148,163,184,.22)"},
  broker:{color:"#fff",fontSize:18,fontWeight:"900"},
  account:{color:"#38BDF8",fontWeight:"800",marginTop:4,marginBottom:10},
  line:{flexDirection:"row",justifyContent:"space-between",borderTopWidth:1,borderTopColor:"rgba(148,163,184,.18)",paddingVertical:10},
  lineLabel:{color:"#CBD5E1"},
  lineValue:{color:"#fff",fontWeight:"900"}
});
