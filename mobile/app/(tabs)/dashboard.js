import { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import API from "../../src/api";

export default function Dashboard() {
  const [account, setAccount] = useState(null);
  useEffect(() => { API.get("/account/u1").then(r => setAccount(r.data)).catch(() => {}); }, []);
  return (
    <ScrollView style={s.page}>
      <Text style={s.title}>GATECEP</Text>
      <Text style={s.subtitle}>AI trading companion + multi-broker connector</Text>
      <View style={s.card}><Text style={s.label}>Equity</Text><Text style={s.value}>KES {account?.equity?.toFixed(2) || "-"}</Text></View>
      <View style={s.card}><Text style={s.label}>Selected Broker</Text><Text style={s.value}>{account?.user?.selectedBrokerId || "-"}</Text></View>
      <View style={s.card}><Text style={s.label}>KYC</Text><Text style={s.value}>{account?.user?.kycStatus || "-"}</Text></View>
    </ScrollView>
  );
}
const s = StyleSheet.create({ page:{flex:1,backgroundColor:"#0b0e11",padding:14}, title:{color:"#f0b90b",fontSize:30,fontWeight:"900"}, subtitle:{color:"#9ca3af",marginBottom:14}, card:{backgroundColor:"#151a21",padding:14,borderRadius:14,marginBottom:12,borderWidth:1,borderColor:"#263241"}, label:{color:"#9ca3af"}, value:{color:"white",fontSize:20,fontWeight:"900",marginTop:6} });
