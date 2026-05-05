import { useEffect,useMemo,useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import API from "../../src/api";
import { Page, Card, InfoRow, Disclaimer } from "../../src/components/ProTradingUI";
import GlobalBalanceCard from "../../src/components/GlobalBalanceCard";
import { P } from "../../src/theme/proTheme"; import { kes } from "../../src/utils/money";

export default function Portfolio(){
 const [account,setAccount]=useState({cash:0}); const [portfolio,setPortfolio]=useState([]); const [prices,setPrices]=useState([]);
 const load=async()=>{const [a,pf,pr]=await Promise.all([API.get("/account/u1"),API.get("/portfolio/u1"),API.get("/prices")]); setAccount(a.data); setPortfolio(pf.data||[]); setPrices(pr.data.data||[]);};
 useEffect(()=>{load().catch(()=>{}); const id=setInterval(()=>load().catch(()=>{}),3500); return()=>clearInterval(id);},[]);
 const holdings=useMemo(()=>portfolio.map(h=>{const p=prices.find(x=>x.symbol===h.symbol); const price=Number(p?.price||h.avgPrice||0); return {...h, marketPrice:price, marketValue:Number(h.qty)*price, investedValue:Number(h.qty)*Number(h.avgPrice)};}),[portfolio,prices]);
 const invested=holdings.reduce((s,h)=>s+h.investedValue,0); const current=holdings.reduce((s,h)=>s+h.marketValue,0); const pnl=current-invested; const total=Number(account?.cash||0)+current;
 return <Page><ScrollView><GlobalBalanceCard availableFunds={account?.cash||0} investedValue={invested} currentValue={current} pnl={pnl}/><Card><Text style={s.section}>Allocation by Securities</Text>{holdings.map(h=><Text key={h.symbol} style={s.row}>{h.symbol}: {kes(h.marketValue)}</Text>)}</Card><Card><Text style={s.section}>Portfolio Summary</Text><InfoRow label="Available Funds" value={kes(account?.cash||0)}/><InfoRow label="Holdings Current Value" value={kes(current)}/><InfoRow label="Invested Value" value={kes(invested)}/><InfoRow label="Unrealized P&L" value={kes(pnl)} tone={pnl>=0?"green":"red"}/><InfoRow label="Total Equity" value={kes(total)}/></Card><Disclaimer/></ScrollView></Page>
}
const s=StyleSheet.create({section:{color:P.color.text,fontSize:18,fontWeight:"900",marginBottom:8},row:{color:P.color.text,paddingVertical:8}});
