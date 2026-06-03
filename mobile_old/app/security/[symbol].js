import { useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import BrokerHeader from "../../src/components/BrokerHeader";
import OrderEntrySheet from "../../src/components/OrderEntrySheet";
import useMarketData from "../../src/hooks/useMarketData";
import { getPriceBand } from "../../src/utils/priceBands";
import { getDepth, getBestBid, getBestOffer, format2, cleanQty } from "../../src/utils/tradeDefaults";

export default function SecurityAnalysis() {
  const { symbol } = useLocalSearchParams();
  const { rows } = useMarketData();
  const [side,setSide]=useState("BUY"),[orderOpen,setOrderOpen]=useState(false),[qty,setQty]=useState(""),[price,setPrice]=useState(""),[orderType,setOrderType]=useState("LIMIT"),[validity,setValidity]=useState("DAY"),[mode,setMode]=useState("Delivery");
  const market = useMemo(()=>rows.find(x=>x.symbol===symbol),[rows,symbol]);
  const depth = useMemo(()=>getDepth(market),[market]);
  const priceBand = useMemo(()=>getPriceBand(market?.price || price || 0,.10,.10),[market,price]);

  const openOrder = (nextSide) => { setSide(nextSide); const d = nextSide==="BUY"?getBestOffer(market):getBestBid(market); setPrice(format2(d.price)); setQty(cleanQty(d.qty)); setOrderOpen(true); };
  const up = Number(market?.changePct || 0) >= 0;

  return <View style={styles.page}>
    <BrokerHeader title={String(symbol)} subtitle={market?.name || "NSE Security"} showBack onBack={()=>router.back()}/>
    <ScrollView style={styles.body}>
      <Text style={[styles.price,{color:up?"#22C55E":"#EF4444"}]}>{Number(market?.price||0).toFixed(2)} {up?"▲":"▼"} {Number(market?.changePct||0).toFixed(2)}</Text>
      <Text style={styles.section}>Market Depth</Text>
      <View style={styles.depthHeader}><Text style={styles.dh}>Bid Qty</Text><Text style={styles.dh}>Bid Price</Text><Text style={styles.dh}>Ask Price</Text><Text style={styles.dh}>Ask Qty</Text></View>
      {Array.from({length:4}).map((_,i)=><View key={i} style={styles.depthRow}><Text style={styles.bid}>{Number(depth.bids?.[i]?.qty||0).toLocaleString("en-KE")}</Text><Text style={styles.bid}>{Number(depth.bids?.[i]?.price||0).toFixed(2)}</Text><Text style={styles.ask}>{Number(depth.asks?.[i]?.price||0).toFixed(2)}</Text><Text style={styles.ask}>{Number(depth.asks?.[i]?.qty||0).toLocaleString("en-KE")}</Text></View>)}
      <Text style={styles.viewMore}>View More</Text>
      <View style={styles.stats}><Stat label="Open" value={market?.open}/><Stat label="High" value={market?.high}/><Stat label="Change%" value={market?.changePct}/><Stat label="Close" value={market?.prevClose}/><Stat label="Low" value={market?.low}/><Stat label="LTT" value={new Date().toLocaleTimeString()}/></View>
      <Text style={styles.section}>Chart</Text><View style={styles.chart}><Text style={styles.chartText}>TradingView-style chart preview</Text></View>
    </ScrollView>
    <View style={styles.actionBar}><Pressable onPress={()=>openOrder("BUY")} style={[styles.action,{backgroundColor:"#2F80C1"}]}><Text style={styles.actionText}>BUY</Text></Pressable><Pressable onPress={()=>openOrder("SELL")} style={[styles.action,{backgroundColor:"#C92835"}]}><Text style={styles.actionText}>SELL</Text></Pressable></View>
    <OrderEntrySheet visible={orderOpen} onClose={()=>setOrderOpen(false)} side={side} symbol={String(symbol)} name={market?.name} qty={qty} setQty={setQty} price={price} setPrice={setPrice} priceBand={priceBand} orderType={orderType} setOrderType={setOrderType} validity={validity} setValidity={setValidity} mode={mode} setMode={setMode} onSubmitted={()=>router.push("/(tabs)/orders")}/>
  </View>;
}
function Stat({label,value}){return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value==null?"-":value}</Text></View>}
const styles=StyleSheet.create({page:{flex:1,backgroundColor:"#08111F"},body:{flex:1},price:{textAlign:"center",fontSize:20,fontWeight:"900",marginTop:-12,marginBottom:16},section:{color:"#fff",fontWeight:"900",fontSize:18,marginHorizontal:16,marginTop:18,marginBottom:10},depthHeader:{flexDirection:"row",marginHorizontal:16},dh:{flex:1,color:"#94A3B8",fontWeight:"900",textAlign:"center",paddingVertical:8},depthRow:{flexDirection:"row",marginHorizontal:16},bid:{flex:1,backgroundColor:"#DBEAFE",textAlign:"center",paddingVertical:10,color:"#111827"},ask:{flex:1,backgroundColor:"#FECACA",textAlign:"center",paddingVertical:10,color:"#111827"},viewMore:{textAlign:"right",color:"#38BDF8",marginRight:24,marginTop:10,fontWeight:"900"},stats:{flexDirection:"row",flexWrap:"wrap",paddingHorizontal:16,paddingVertical:14,borderTopWidth:1,borderBottomWidth:1,borderColor:"rgba(148,163,184,.28)",marginTop:12},stat:{width:"33%",paddingVertical:8},statLabel:{color:"#94A3B8"},statValue:{color:"#fff",fontWeight:"900",marginTop:4},chart:{height:190,marginHorizontal:16,borderRadius:8,backgroundColor:"#111D35",borderWidth:1,borderColor:"rgba(148,163,184,.28)",alignItems:"center",justifyContent:"center",marginBottom:100},chartText:{color:"#94A3B8"},actionBar:{flexDirection:"row",position:"absolute",left:0,right:0,bottom:0,height:64},action:{flex:1,alignItems:"center",justifyContent:"center"},actionText:{color:"#fff",fontWeight:"900",fontSize:18}});
