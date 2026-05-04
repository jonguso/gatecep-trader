import { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import API from "../../src/api";
import { Card } from "../../src/components";
import { COLORS } from "../../src/config";

export default function Portfolio() {
  const [rows, setRows] = useState([]);
  useEffect(() => { API.get("/portfolio/u1").then(r => setRows(r.data)).catch(() => {}); }, []);
  return <ScrollView style={s.page}><Text style={s.title}>Portfolio</Text>{rows.length === 0 && <Card><Text style={s.muted}>No holdings yet.</Text></Card>}{rows.map(p => <Card key={p.symbol}><View style={s.row}><Text style={s.symbol}>{p.symbol}</Text><Text style={p.totalPnl >= 0 ? s.green : s.red}>KES {p.totalPnl?.toFixed(2)}</Text></View><Text style={s.muted}>Qty {p.qty} - Value KES {p.marketValue?.toFixed(2)}</Text></Card>)}</ScrollView>;
}
const s = StyleSheet.create({page:{flex:1,backgroundColor:COLORS.bg,padding:14},title:{color:COLORS.gold,fontSize:26,fontWeight:"900",marginBottom:14},row:{flexDirection:"row",justifyContent:"space-between"},symbol:{color:COLORS.white,fontSize:20,fontWeight:"900"},muted:{color:COLORS.muted,marginTop:6},green:{color:COLORS.green,fontWeight:"900"},red:{color:COLORS.red,fontWeight:"900"}});
