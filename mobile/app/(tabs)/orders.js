import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import API from "../../src/api";
import { Page } from "../../src/components/ProTradingUI";
import BrokerHeader from "../../src/components/BrokerHeader";

export default function Orders() {
  const [tab,setTab]=useState("All Orders"),[q,setQ]=useState(""),[orders,setOrders]=useState([]);
  const load=async()=>{const r=await API.get("/orders?userId=u1");setOrders(r.data||[])};
  useEffect(()=>{load().catch(()=>{});const id=setInterval(()=>load().catch(()=>{}),5000);return()=>clearInterval(id)},[]);
  const list=useMemo(()=>{let rows=orders;if(tab==="Pending Orders")rows=rows.filter(x=>["PENDING","OPEN","ROUTED","ACCEPTED"].includes(String(x.status).toUpperCase()));if(q)rows=rows.filter(x=>String(x.symbol||"").toLowerCase().includes(q.toLowerCase()));return rows},[orders,tab,q]);
  return <Page><BrokerHeader title="Orders"/><ScrollView style={styles.body}><View style={styles.tabs}>{["All Orders","Pending Orders"].map(x=><Pressable key={x} onPress={()=>setTab(x)} style={[styles.tab,tab===x&&styles.active]}><Text style={[styles.tabText,tab===x&&styles.activeText]}>{x}</Text></Pressable>)}</View><View style={styles.searchBox}><TextInput value={q} onChangeText={setQ} placeholder="Search eg :BBK" placeholderTextColor="#94A3B8" style={styles.search}/></View><View style={styles.header}><Text style={styles.th}>Date/Time▲</Text><Text style={styles.th}>Description▲</Text><Text style={styles.th}>Working Order?▲</Text></View>{list.length===0?<Text style={styles.empty}>No Details Found</Text>:list.map(o=><View key={o.id} style={styles.row}><Text style={styles.td}>{new Date(o.submittedAt||Date.now()).toLocaleString()}</Text><Text style={styles.td}>{o.side} {o.symbol} {o.qty} @ {o.price}</Text><Text style={styles.td}>{o.status}</Text></View>)}</ScrollView></Page>
}
const styles=StyleSheet.create({body:{backgroundColor:"#08111F"},tabs:{flexDirection:"row",backgroundColor:"#06154A",paddingHorizontal:16},tab:{flex:1,alignItems:"center",paddingBottom:12},active:{borderBottomWidth:2,borderBottomColor:"#22D3EE"},tabText:{color:"#fff",fontWeight:"800"},activeText:{color:"#22D3EE"},searchBox:{margin:16,borderRadius:10,backgroundColor:"#111D35",borderWidth:1,borderColor:"rgba(148,163,184,.28)"},search:{minHeight:52,paddingHorizontal:16,color:"#fff"},header:{flexDirection:"row",backgroundColor:"#16233F",paddingVertical:12},th:{flex:1,color:"#94A3B8",fontWeight:"900",textAlign:"center",fontSize:12},empty:{textAlign:"center",color:"#94A3B8",marginTop:16},row:{flexDirection:"row",borderBottomWidth:1,borderBottomColor:"rgba(148,163,184,.18)",paddingVertical:14},td:{flex:1,color:"#fff",textAlign:"center",fontSize:12}});
