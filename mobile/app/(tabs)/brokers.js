import { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import API from "../../src/api";
import { RiskDisclaimer } from "../../src/components";
import { COLORS } from "../../src/config";

export default function Brokers() {
  const [brokers, setBrokers] = useState([]);
  const [links, setLinks] = useState([]);
  const load = async () => { setBrokers((await API.get("/brokers")).data); setLinks((await API.get("/brokers/links?userId=u1")).data); };
  useEffect(() => { load().catch(() => {}); }, []);
  const linkStatus = id => links.find(l => l.brokerId === id)?.status || "NOT LINKED";

  return (
    <ScrollView style={s.page}>
      <Text style={s.title}>Broker Marketplace</Text>
      <Pressable style={s.wizard} onPress={() => router.push("/onboarding/broker-wizard")}><Text style={s.wizardText}>Start Step-by-Step Broker Onboarding</Text></Pressable>
      {brokers.map(b => <View key={b.id} style={s.card}><Text style={s.name}>{b.name}</Text><Text style={s.muted}>{b.notes}</Text><Text style={s.gold}>Status: {b.status}</Text><Text style={s.white}>Link: {linkStatus(b.id)}</Text></View>)}
      <RiskDisclaimer />
    </ScrollView>
  );
}

const s = StyleSheet.create({page:{flex:1,backgroundColor:COLORS.bg,padding:14},title:{color:COLORS.gold,fontSize:26,fontWeight:"900",marginBottom:14},wizard:{backgroundColor:COLORS.gold,padding:14,borderRadius:10,marginBottom:14},wizardText:{color:"#111827",fontWeight:"900",textAlign:"center"},card:{backgroundColor:COLORS.card,padding:14,borderRadius:14,marginBottom:12,borderWidth:1,borderColor:COLORS.border},name:{color:COLORS.white,fontSize:18,fontWeight:"900"},muted:{color:COLORS.muted,marginTop:6},gold:{color:COLORS.gold,marginTop:6,fontWeight:"800"},white:{color:COLORS.white,marginTop:6}});
