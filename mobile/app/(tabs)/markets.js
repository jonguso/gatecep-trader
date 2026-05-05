import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import API from "../../src/api";
import { Page, Header, Segments, Card, Disclaimer } from "../../src/components/ProTradingUI";
import { P } from "../../src/theme/proTheme";
import { kes } from "../../src/utils/money";
import { kesCompact, compactNumber } from "../../src/utils/marketFormat";

export default function Markets(){
  const [tab,setTab]=useState("Watchlist");
  const [rows,setRows]=useState([]);
  const load=async()=>{ const r=await API.get("/prices"); setRows(r.data.data||[]); };
  useEffect(()=>{load().catch(()=>{}); const id=setInterval(()=>load().catch(()=>{}),3500); return()=>clearInterval(id);},[]);
  const list=useMemo(()=>{
    if(tab==="Gainers") return rows.filter(x=>x.changePct>0).sort((a,b)=>b.changePct-a.changePct).slice(0,10);
    if(tab==="Losers") return rows.filter(x=>x.changePct<0).sort((a,b)=>a.changePct-b.changePct).slice(0,5);
    if(tab==="Movers") return [...rows].sort((a,b)=>b.turnover-a.turnover).slice(0,5);
    return [...rows].sort((a,b)=>a.symbol.localeCompare(b.symbol));
  },[rows,tab]);
  return <Page><Header title="Markets"/><ScrollView><Segments tabs={["Watchlist","Gainers","Losers","Movers"]} active={tab} onChange={setTab}/><Card><Text style={s.section}>{tab==="Watchlist"?"Watchlist - All NSE Securities":tab}</Text>{list.map(x=><Text key={x.symbol} onPress={()=>router.push({pathname:"/trade",params:{symbol:x.symbol,side:"BUY"}})} style={s.row}>{x.symbol}  {x.name}   {kes(x.price)}   {x.changePct>0?"▲":"▼"} {x.changePct}%{"\n"}<Text style={s.meta}>Vol {compactNumber(x.volume)} · Turnover {kesCompact(x.turnover)}</Text></Text>)}</Card><Disclaimer/></ScrollView></Page>;
}
const s=StyleSheet.create({section:{color:P.color.text,fontSize:18,fontWeight:"900",marginBottom:8},row:{color:P.color.text,paddingVertical:12,borderBottomWidth:1,borderBottomColor:P.color.border,fontWeight:"900"},meta:{color:P.color.muted,fontSize:11}});
