import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import API, { API_BASE } from "./src/api";

export default function App() {
  const [userId,setUserId]=useState("u1"), [symbol,setSymbol]=useState("SCOM");
  const [securities,setSecurities]=useState([]), [prices,setPrices]=useState({}), [account,setAccount]=useState(null), [portfolio,setPortfolio]=useState([]), [book,setBook]=useState({bids:[],asks:[]}), [signal,setSignal]=useState(null);
  const [order,setOrder]=useState({side:"BUY",price:"15",qty:"1"});

  const load=async()=>{setSecurities((await API.get("/securities")).data); const p=(await API.get("/prices")).data; setPrices(Object.fromEntries(p.data.map(x=>[x.symbol,x.price]))); setAccount((await API.get(`/account/${userId}`)).data); setPortfolio((await API.get(`/portfolio/${userId}`)).data); setSignal((await API.get(`/recommendation/${symbol}/${userId}`)).data);};
  useEffect(()=>{load().catch(()=>{})},[userId,symbol]);
  useEffect(()=>{const ws=new WebSocket(API_BASE.replace("http","ws")); ws.onmessage=e=>{const msg=JSON.parse(e.data); if(msg.type==="price")setPrices(msg.data.prices); if(msg.type==="orderbook"&&msg.data.symbol===symbol)setBook(msg.data); if(msg.type==="account_update")load().catch(()=>{});}; return()=>ws.close();},[userId,symbol]);
  useEffect(()=>{if(prices[symbol])setOrder(o=>({...o,price:String(prices[symbol])}))},[symbol,prices]);

  const seed=async()=>{const px=prices[symbol]||15; await API.post("/order",{userId:"u2",symbol,side:"SELL",price:px+0.2,qty:200}); await API.post("/order",{userId:"u1",symbol,side:"BUY",price:px-0.2,qty:100}); load();};
  const trade=async()=>{try{await API.post("/order",{userId,symbol,side:order.side,price:Number(order.price),qty:Number(order.qty)}); load();}catch(e){alert(e.response?.data?.error||"Order failed")}};

  return <SafeAreaView style={s.safe}><StatusBar style="light"/><ScrollView style={s.page}>
    <View style={s.header}><Text style={s.title}>GATECEP AI Coach</Text><Text style={s.gold}>{symbol} {prices[symbol]||"-"}</Text></View>
    <ScrollView horizontal style={{marginBottom:8}}>{securities.map(x=><Pressable key={x.symbol} onPress={()=>setSymbol(x.symbol)} style={[s.chip,symbol===x.symbol&&s.active]}><Text style={s.chipText}>{x.symbol}</Text></Pressable>)}</ScrollView>
    <View style={s.row}><Pressable style={[s.btn,userId==="u1"&&s.active]} onPress={()=>setUserId("u1")}><Text style={s.btnt}>Demo</Text></Pressable><Pressable style={[s.btn,userId==="u2"&&s.active]} onPress={()=>setUserId("u2")}><Text style={s.btnt}>Maker</Text></Pressable></View>
    <Pressable style={s.goldBtn} onPress={seed}><Text style={s.dark}>Seed {symbol} Liquidity</Text></Pressable>
    <Card title="Coach G">{signal&&<><Text style={[s.big,{color:signal.action==="BUY"?"#22c55e":signal.action==="SELL"?"#ef4444":"#f0b90b"}]}>{signal.action} {signal.confidence}%</Text><Text style={s.text}>{signal.message}</Text></>}</Card>
    <Card title="Account">{account&&<><Text style={s.text}>Cash KES {account.cash.toFixed(2)}</Text><Text style={s.text}>Equity KES {account.equity.toFixed(2)}</Text><Text style={s.text}>P&L KES {account.totalPnl.toFixed(2)}</Text></>}</Card>
    <Card title="Portfolio">{portfolio.length===0?<Text style={s.text}>No holdings.</Text>:portfolio.map(h=><Text key={h.symbol} style={s.text}>{h.symbol} Qty {h.qty} P&L {h.totalPnl.toFixed(2)}</Text>)}</Card>
    <Card title={`${symbol} Depth`}><Text style={s.ask}>ASKS</Text>{book.asks.slice().reverse().map((a,i)=><Depth key={i} x={a} color="#ef4444" setOrder={setOrder}/>)}<Text style={s.bid}>BIDS</Text>{book.bids.map((b,i)=><Depth key={i} x={b} color="#22c55e" setOrder={setOrder}/>)}</Card>
    <Card title={`Trade ${symbol}`}><View style={s.row}><Pressable style={[s.btn,order.side==="BUY"&&s.active]} onPress={()=>setOrder({...order,side:"BUY"})}><Text style={s.btnt}>BUY</Text></Pressable><Pressable style={[s.btn,order.side==="SELL"&&s.active]} onPress={()=>setOrder({...order,side:"SELL"})}><Text style={s.btnt}>SELL</Text></Pressable></View><TextInput style={s.input} value={order.price} onChangeText={v=>setOrder({...order,price:v})}/><TextInput style={s.input} value={order.qty} onChangeText={v=>setOrder({...order,qty:v})}/><Pressable style={s.goldBtn} onPress={trade}><Text style={s.dark}>Submit</Text></Pressable></Card>
  </ScrollView></SafeAreaView>;
}
function Card({title,children}){return <View style={s.card}><Text style={s.cardTitle}>{title}</Text>{children}</View>}; function Depth({x,color,setOrder}){return <Pressable onPress={()=>setOrder(o=>({...o,price:String(x.price),qty:String(x.qty)}))} style={s.depth}><Text style={{color}}>{x.price}</Text><Text style={{color}}>{x.qty}</Text></Pressable>}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:"#0b0e11"},page:{backgroundColor:"#0b0e11",padding:12},header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:12},title:{color:"white",fontSize:24,fontWeight:"800"},gold:{color:"#f0b90b",fontSize:18,fontWeight:"700"},row:{flexDirection:"row",gap:8,marginVertical:8},btn:{flex:1,backgroundColor:"#1e2329",padding:10,borderRadius:10},active:{borderWidth:1,borderColor:"#f0b90b"},btnt:{color:"white",textAlign:"center",fontWeight:"700"},goldBtn:{backgroundColor:"#f0b90b",padding:12,borderRadius:10,marginTop:8},dark:{color:"#111827",textAlign:"center",fontWeight:"800"},card:{backgroundColor:"#1e2329",padding:14,borderRadius:12,marginBottom:10},cardTitle:{color:"white",fontSize:18,fontWeight:"800",marginBottom:8},text:{color:"#d1d5db",marginVertical:3},big:{fontSize:22,fontWeight:"800"},ask:{color:"#ef4444",fontWeight:"800"},bid:{color:"#22c55e",fontWeight:"800",marginTop:8},depth:{flexDirection:"row",justifyContent:"space-between",paddingVertical:5},input:{backgroundColor:"#0b0e11",color:"white",padding:10,borderRadius:8,marginTop:8},chip:{backgroundColor:"#1e2329",padding:8,borderRadius:8,marginRight:6},chipText:{color:"white"}});
