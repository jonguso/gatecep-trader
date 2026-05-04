import { useEffect, useState } from "react";
import { ScrollView, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import API from "../../src/api";
import { Card } from "../../src/components";
import { COLORS } from "../../src/config";

export default function Markets() {
  const [securities, setSecurities] = useState([]);
  const [prices, setPrices] = useState({});
  useEffect(() => { Promise.all([API.get("/securities"), API.get("/prices")]).then(([s,p]) => { setSecurities(s.data); setPrices(Object.fromEntries((p.data.data || []).map(x => [x.symbol, x.price]))); }).catch(()=>{}); }, []);

  return (
    <ScrollView style={s.page}>
      <Text style={s.title}>Market Watch</Text>
      <Card>{securities.map(x => <Pressable key={x.symbol} style={s.row} onPress={() => router.push({ pathname: "/trade", params: { symbol: x.symbol } })}><Text style={s.symbol}>{x.symbol}</Text><Text style={s.name}>{x.name}</Text><Text style={s.price}>{prices[x.symbol] || "-"}</Text></Pressable>)}</Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({page:{flex:1,backgroundColor:COLORS.bg,padding:14},title:{color:COLORS.gold,fontSize:26,fontWeight:"900",marginBottom:14},row:{paddingVertical:11,borderBottomWidth:1,borderBottomColor:COLORS.border},symbol:{color:COLORS.white,fontWeight:"900",fontSize:16},name:{color:COLORS.muted,marginTop:3},price:{color:COLORS.gold,fontWeight:"800",marginTop:4}});
