import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import API from "../../src/api";
import { Card, RiskDisclaimer } from "../../src/components";
import { COLORS } from "../../src/config";

export default function Trade() {
  const params = useLocalSearchParams();
  const [symbol, setSymbol] = useState(params.symbol || "SCOM");
  const [side, setSide] = useState("BUY");
  const [price, setPrice] = useState("15");
  const [qty, setQty] = useState("100");
  const [result, setResult] = useState(null);

  useEffect(() => { if (params.symbol) setSymbol(params.symbol); }, [params.symbol]);

  const submit = async () => {
    try {
      const res = await API.post("/order", { userId:"u1", symbol, side, price:Number(price), qty:Number(qty) });
      setResult(res.data);
    } catch(e) { alert(e.response?.data?.error || "Order failed"); }
  };

  return (
    <ScrollView style={s.page}>
      <Text style={s.title}>Broker-Aware Trade</Text>
      <View style={s.symbols}>{["SCOM","KCB","EQTY","EABL","COOP"].map(x => <Pressable key={x} onPress={() => setSymbol(x)} style={[s.chip, symbol === x && s.activeChip]}><Text style={s.chipText}>{x}</Text></Pressable>)}</View>
      <Card title="Order Ticket">
        <Text style={s.label}>Symbol</Text><TextInput style={s.input} value={symbol} onChangeText={setSymbol}/>
        <View style={s.row}><Pressable style={side==="BUY"?s.buy:s.btn} onPress={() => setSide("BUY")}><Text style={s.btnText}>BUY</Text></Pressable><Pressable style={side==="SELL"?s.sell:s.btn} onPress={() => setSide("SELL")}><Text style={s.btnText}>SELL</Text></Pressable></View>
        <Text style={s.label}>Limit Price</Text><TextInput style={s.input} value={price} onChangeText={setPrice} keyboardType="numeric"/>
        <Text style={s.label}>Quantity</Text><TextInput style={s.input} value={qty} onChangeText={setQty} keyboardType="numeric"/>
        <Text style={s.value}>Estimated value: KES {(Number(price) * Number(qty || 0)).toFixed(2)}</Text>
        <Pressable style={side==="BUY"?s.buySubmit:s.sellSubmit} onPress={submit}><Text style={s.btnText}>Submit to Broker</Text></Pressable>
      </Card>
      {result && <Card title="Broker Response"><Text style={s.white}>{result.brokerResponse?.brokerStatus || "ROUTED"}</Text><Text style={s.muted}>{result.brokerResponse?.message || result.message}</Text><Text style={s.gold}>Estimated fees: KES {result.risk?.estimatedBrokerFees || "-"}</Text></Card>}
      <RiskDisclaimer />
    </ScrollView>
  );
}
const s = StyleSheet.create({page:{flex:1,backgroundColor:COLORS.bg,padding:14},title:{color:COLORS.gold,fontSize:24,fontWeight:"900"},symbols:{flexDirection:"row",flexWrap:"wrap",gap:8,marginVertical:12},chip:{backgroundColor:COLORS.card,padding:8,borderRadius:18,borderWidth:1,borderColor:COLORS.border},activeChip:{borderColor:COLORS.gold},chipText:{color:COLORS.white,fontWeight:"800"},label:{color:COLORS.muted,marginTop:8},input:{backgroundColor:COLORS.bg,color:COLORS.white,padding:12,borderRadius:10,borderWidth:1,borderColor:COLORS.border,marginTop:4},row:{flexDirection:"row",gap:10,marginVertical:10},btn:{flex:1,backgroundColor:"#1e293b",padding:12,borderRadius:10},buy:{flex:1,backgroundColor:COLORS.green,padding:12,borderRadius:10},sell:{flex:1,backgroundColor:COLORS.red,padding:12,borderRadius:10},btnText:{color:COLORS.white,textAlign:"center",fontWeight:"900"},buySubmit:{backgroundColor:COLORS.green,padding:14,borderRadius:10,marginTop:10},sellSubmit:{backgroundColor:COLORS.red,padding:14,borderRadius:10,marginTop:10},value:{color:COLORS.white,fontWeight:"800",marginTop:12},white:{color:COLORS.white,lineHeight:22},muted:{color:COLORS.muted,marginTop:6},gold:{color:COLORS.gold,marginTop:8,fontWeight:"800"}});
