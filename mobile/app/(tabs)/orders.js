import { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import API from "../../src/api";
import { Card } from "../../src/components";
import { COLORS } from "../../src/config";

export default function Orders() {
  const [rows, setRows] = useState([]);
  useEffect(() => { API.get("/orders?userId=u1").then(r => setRows(r.data)).catch(() => {}); }, []);
  return <ScrollView style={s.page}><Text style={s.title}>Orders</Text>{rows.length === 0 && <Card><Text style={s.muted}>No orders yet.</Text></Card>}{rows.map(o => <Card key={o.id}><View style={s.row}><Text style={s.symbol}>{o.symbol}</Text><Text style={o.side === "BUY" ? s.green : s.red}>{o.side}</Text></View><Text style={s.white}>{o.qty || o.originalQty} @ {o.price}</Text><Text style={s.muted}>Status: {o.status}</Text><Text style={s.muted}>Broker: {o.brokerId || "-"}</Text></Card>)}</ScrollView>;
}
const s = StyleSheet.create({page:{flex:1,backgroundColor:COLORS.bg,padding:14},title:{color:COLORS.gold,fontSize:26,fontWeight:"900",marginBottom:14},row:{flexDirection:"row",justifyContent:"space-between"},symbol:{color:COLORS.white,fontSize:20,fontWeight:"900"},muted:{color:COLORS.muted,marginTop:6},white:{color:COLORS.white,marginTop:6},green:{color:COLORS.green,fontWeight:"900"},red:{color:COLORS.red,fontWeight:"900"}});
