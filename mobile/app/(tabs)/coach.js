import { useState } from "react";
import { ScrollView, Text, Pressable, StyleSheet, View } from "react-native";
import API from "../../src/api";
import { Card, RiskDisclaimer } from "../../src/components";
import { COLORS } from "../../src/config";

export default function Coach() {
  const [symbol, setSymbol] = useState("SCOM");
  const [answer, setAnswer] = useState("");
  const [rec, setRec] = useState(null);
  const ask = async () => { const res = await API.post("/ai/chat", { userId:"u1", symbol }); setAnswer(res.data.answer); setRec(res.data.recommendation); };

  return (
    <ScrollView style={s.page}>
      <Text style={s.title}>Coach G</Text>
      <Text style={s.subtitle}>Broker-aware AI decision support.</Text>
      <View style={s.symbols}>{["SCOM","KCB","EQTY","EABL","COOP"].map(x => <Pressable key={x} onPress={() => setSymbol(x)} style={[s.chip, symbol === x && s.activeChip]}><Text style={s.chipText}>{x}</Text></Pressable>)}</View>
      <Pressable style={s.button} onPress={ask}><Text style={s.buttonText}>Should I buy {symbol}?</Text></Pressable>
      {!!answer && <Card title="Coach G Recommendation"><Text style={s.action}>{rec?.action} - {rec?.confidence}% confidence</Text><Text style={s.white}>{answer}</Text><Text style={s.muted}>Broker: {rec?.broker}</Text></Card>}
      <RiskDisclaimer />
    </ScrollView>
  );
}
const s = StyleSheet.create({page:{flex:1,backgroundColor:COLORS.bg,padding:14},title:{color:COLORS.gold,fontSize:26,fontWeight:"900"},subtitle:{color:COLORS.muted,marginBottom:14},symbols:{flexDirection:"row",flexWrap:"wrap",gap:8,marginBottom:12},chip:{backgroundColor:COLORS.card,padding:8,borderRadius:18,borderWidth:1,borderColor:COLORS.border},activeChip:{borderColor:COLORS.gold},chipText:{color:COLORS.white,fontWeight:"800"},button:{backgroundColor:COLORS.gold,padding:14,borderRadius:10,marginBottom:12},buttonText:{color:"#111827",textAlign:"center",fontWeight:"900"},action:{color:COLORS.gold,fontSize:20,fontWeight:"900",marginBottom:8},white:{color:COLORS.white,lineHeight:22},muted:{color:COLORS.muted,marginTop:8}});
