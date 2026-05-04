import { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import API from "../../src/api";

export default function Portfolio() {
  const [rows, setRows] = useState([]);
  useEffect(() => { API.get("/portfolio/u1").then(r => setRows(r.data)).catch(() => {}); }, []);
  return <ScrollView style={s.page}><Text style={s.title}>Portfolio</Text>{rows.length===0?<Text style={s.muted}>No holdings yet.</Text>:rows.map(p=><View key={p.symbol} style={s.card}><Text style={s.symbol}>{p.symbol}</Text><Text style={s.muted}>Qty {p.qty} · Value KES {p.marketValue?.toFixed(2)}</Text></View>)}</ScrollView>;
}
const s = StyleSheet.create({ page:{flex:1,backgroundColor:"#0b0e11",padding:14}, title:{color:"#f0b90b",fontSize:24,fontWeight:"900"}, card:{backgroundColor:"#151a21",padding:14,borderRadius:14,marginTop:12,borderWidth:1,borderColor:"#263241"}, symbol:{color:"white",fontSize:20,fontWeight:"900"}, muted:{color:"#9ca3af",marginTop:6} });
