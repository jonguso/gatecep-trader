import { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import API from "../../src/api";
import { Card, RiskDisclaimer } from "../../src/components";
import { COLORS } from "../../src/config";

export default function Dashboard() {
  const [account, setAccount] = useState(null);
  useEffect(() => { API.get("/account/u1").then(r => setAccount(r.data)).catch(() => {}); }, []);

  return (
    <ScrollView style={s.page}>
      <Text style={s.title}>GATECEP</Text>
      <Text style={s.subtitle}>AI trading companion for NSE investors</Text>
      <View style={s.grid}>
        <Metric title="Equity" value={`KES ${account?.equity?.toFixed(2) || "-"}`} />
        <Metric title="Cash" value={`KES ${account?.cash?.toFixed(2) || "-"}`} />
        <Metric title="Broker" value={account?.user?.selectedBrokerId || "-"} />
        <Metric title="KYC" value={account?.user?.kycStatus || "-"} />
      </View>
      <Card title="Quick Actions">
        <Action label="Broker Wizard" onPress={() => router.push("/onboarding/broker-wizard")} />
        <Action label="Markets" onPress={() => router.push("/markets")} />
        <Action label="Trade" onPress={() => router.push("/trade")} />
        <Action label="Coach G" onPress={() => router.push("/coach")} />
      </Card>
      <RiskDisclaimer />
    </ScrollView>
  );
}

function Metric({ title, value }) { return <View style={s.metric}><Text style={s.metricLabel}>{title}</Text><Text style={s.metricValue}>{value}</Text></View>; }
function Action({ label, onPress }) { return <Pressable style={s.action} onPress={onPress}><Text style={s.actionText}>{label}</Text></Pressable>; }

const s = StyleSheet.create({page:{flex:1,backgroundColor:COLORS.bg,padding:14},title:{color:COLORS.gold,fontSize:30,fontWeight:"900"},subtitle:{color:COLORS.muted,marginBottom:14},grid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between"},metric:{backgroundColor:COLORS.card,borderWidth:1,borderColor:COLORS.border,borderRadius:14,padding:14,width:"48%",marginBottom:10},metricLabel:{color:COLORS.muted},metricValue:{color:COLORS.white,fontSize:17,fontWeight:"900",marginTop:6},action:{backgroundColor:"#1e293b",padding:12,borderRadius:10,marginTop:8},actionText:{color:COLORS.white,textAlign:"center",fontWeight:"800"}});
