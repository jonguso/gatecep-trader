import { useState } from "react";
import { ScrollView, Text, Pressable, StyleSheet, View } from "react-native";
import API from "../../src/api";

export default function Coach() {
  const [symbol, setSymbol] = useState("SCOM");
  const [answer, setAnswer] = useState("");
  const ask = async () => setAnswer((await API.post("/ai/chat", { userId:"u1", symbol })).data.answer);
  return (
    <ScrollView style={s.page}>
      <Text style={s.title}>Coach G</Text>
      <Text style={s.muted}>Broker-aware AI decision support.</Text>
      <View style={s.symbols}>{["SCOM","KCB","EQTY","EABL","COOP"].map(x=><Pressable key={x} onPress={()=>setSymbol(x)} style={s.chip}><Text style={s.chipText}>{x}</Text></Pressable>)}</View>
      <Pressable style={s.button} onPress={ask}><Text style={s.buttonText}>Should I buy {symbol}?</Text></Pressable>
      {!!answer && <View style={s.card}><Text style={s.answer}>{answer}</Text><Text style={s.disclaimer}>AI-assisted analysis only. Confirm orders with your selected licensed broker.</Text></View>}
    </ScrollView>
  );
}
const s = StyleSheet.create({ page:{flex:1,backgroundColor:"#0b0e11",padding:14}, title:{color:"#f0b90b",fontSize:26,fontWeight:"900"}, muted:{color:"#9ca3af",marginTop:6}, symbols:{flexDirection:"row",gap:8,marginTop:12}, chip:{backgroundColor:"#151a21",padding:8,borderRadius:18,borderWidth:1,borderColor:"#263241"}, chipText:{color:"white",fontWeight:"800"}, button:{backgroundColor:"#f0b90b",padding:14,borderRadius:10,marginTop:18}, buttonText:{color:"#111827",textAlign:"center",fontWeight:"900"}, card:{backgroundColor:"#151a21",padding:14,borderRadius:14,marginTop:12,borderWidth:1,borderColor:"#263241"}, answer:{color:"white",lineHeight:22}, disclaimer:{color:"#f0b90b",marginTop:12,fontWeight:"800"} });
