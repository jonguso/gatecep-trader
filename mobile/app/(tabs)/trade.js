import { useState } from "react";
import { ScrollView, Text, TextInput, Pressable, StyleSheet, View } from "react-native";
import API from "../../src/api";

export default function Trade() {
  const [symbol, setSymbol] = useState("SCOM");
  const [side, setSide] = useState("BUY");
  const [price, setPrice] = useState("15");
  const [qty, setQty] = useState("100");
  const [result, setResult] = useState(null);

  const submit = async () => {
    try {
      const res = await API.post("/order", { userId: "u1", symbol, side, price: Number(price), qty: Number(qty) });
      setResult(res.data);
    } catch (e) {
      alert(e.response?.data?.error || "Order failed");
    }
  };

  return (
    <ScrollView style={s.page}>
      <Text style={s.title}>Broker-Aware Trade</Text>
      <Text style={s.muted}>Order routes to your selected broker.</Text>
      <View style={s.symbols}>{["SCOM","KCB","EQTY","EABL","COOP"].map(x=><Pressable key={x} onPress={()=>setSymbol(x)} style={s.chip}><Text style={s.chipText}>{x}</Text></Pressable>)}</View>
      <View style={s.card}>
        <Text style={s.label}>Symbol</Text><TextInput style={s.input} value={symbol} onChangeText={setSymbol}/>
        <Text style={s.label}>Side</Text>
        <View style={s.row}><Pressable style={side==="BUY"?s.buy:s.btn} onPress={()=>setSide("BUY")}><Text style={s.btnText}>BUY</Text></Pressable><Pressable style={side==="SELL"?s.sell:s.btn} onPress={()=>setSide("SELL")}><Text style={s.btnText}>SELL</Text></Pressable></View>
        <Text style={s.label}>Price</Text><TextInput style={s.input} value={price} onChangeText={setPrice}/>
        <Text style={s.label}>Qty</Text><TextInput style={s.input} value={qty} onChangeText={setQty}/>
        <Pressable style={s.submit} onPress={submit}><Text style={s.submitText}>Submit to Broker</Text></Pressable>
      </View>
      {result && <View style={s.card}><Text style={s.title2}>Broker Response</Text><Text style={s.muted}>{JSON.stringify(result.brokerResponse, null, 2)}</Text><Text style={s.muted}>{result.risk?.estimatedBrokerFees ? `Estimated Fees: KES ${result.risk.estimatedBrokerFees}` : ""}</Text></View>}
    </ScrollView>
  );
}
const s = StyleSheet.create({ page:{flex:1,backgroundColor:"#0b0e11",padding:14}, title:{color:"#f0b90b",fontSize:24,fontWeight:"900"}, title2:{color:"white",fontSize:18,fontWeight:"900"}, muted:{color:"#9ca3af",marginTop:6}, card:{backgroundColor:"#151a21",padding:14,borderRadius:14,marginTop:12,borderWidth:1,borderColor:"#263241"}, label:{color:"#9ca3af",marginTop:8}, input:{backgroundColor:"#0b0e11",color:"white",padding:12,borderRadius:10,borderWidth:1,borderColor:"#263241"}, row:{flexDirection:"row",gap:10,marginVertical:8}, btn:{flex:1,backgroundColor:"#1e293b",padding:12,borderRadius:10}, buy:{flex:1,backgroundColor:"#16a34a",padding:12,borderRadius:10}, sell:{flex:1,backgroundColor:"#dc2626",padding:12,borderRadius:10}, btnText:{color:"white",textAlign:"center",fontWeight:"900"}, submit:{backgroundColor:"#f0b90b",padding:14,borderRadius:10,marginTop:14}, submitText:{color:"#111827",textAlign:"center",fontWeight:"900"}, symbols:{flexDirection:"row",gap:8,marginTop:12}, chip:{backgroundColor:"#151a21",padding:8,borderRadius:18,borderWidth:1,borderColor:"#263241"}, chipText:{color:"white",fontWeight:"800"} });
