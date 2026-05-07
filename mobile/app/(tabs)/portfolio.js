import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import API from "../../src/api";
import { Page, CTA } from "../../src/components/ProTradingUI";
import BrokerHeader from "../../src/components/BrokerHeader";
import GlobalAccountHeader from "../../src/components/GlobalAccountHeader";
import PortfolioDetailsModal from "../../src/components/PortfolioDetailsModal";
import { AIInsightsCard, DonutChartCard, DrilldownPanel, buildPortfolioAnalytics } from "../../src/components/PortfolioDrilldownCharts";

function mergePortfolioWithPrices(portfolioRows, priceRows) {
  const priceMap = Object.fromEntries((priceRows || []).map(x => [x.symbol, { price:Number(x.price||x.lastPrice||0), sector:x.sector||"Other", name:x.name }]));
  return (portfolioRows || []).filter(h=>Number(h.qty||0)>0).map(h=>{const m=priceMap[h.symbol]||{};const qty=Number(h.qty||0),avgPrice=Number(h.avgPrice||0),marketPrice=Number(h.marketPrice||m.price||avgPrice||0);return {...h,name:h.name||m.name,sector:h.sector||m.sector||"Other",qty,avgPrice,marketPrice,marketValue:qty*marketPrice,investedValue:qty*avgPrice}});
}

export default function Portfolio() {
  const [account,setAccount]=useState({cash:0}),[portfolio,setPortfolio]=useState([]),[prices,setPrices]=useState([]),[detailsOpen,setDetailsOpen]=useState(false),[selected,setSelected]=useState(null);
  useEffect(()=>{Promise.all([API.get("/account/u1"),API.get("/portfolio/u1"),API.get("/prices")]).then(([a,pf,p])=>{setAccount(a.data||{cash:0});setPortfolio(pf.data||[]);setPrices(p.data?.data||[])}).catch(()=>{})},[]);
  const holdings=useMemo(()=>mergePortfolioWithPrices(portfolio,prices),[portfolio,prices]);
  const analytics=useMemo(()=>buildPortfolioAnalytics({holdings,availableFunds:Number(account?.cash||0)}),[holdings,account]);
  return <Page><BrokerHeader title="Portfolio"/><ScrollView style={styles.body}><GlobalAccountHeader/><DonutChartCard title="Allocation by Securities" data={analytics.bySecurity} selected={selected?.type==="security"?selected:null} onSelect={setSelected}/><DonutChartCard title="Allocation by Industries" data={analytics.byIndustry} selected={selected?.type==="industry"?selected:null} onSelect={setSelected}/><DrilldownPanel selected={selected} holdings={holdings} onClear={()=>setSelected(null)}/><AIInsightsCard analytics={analytics}/><CTA onPress={()=>setDetailsOpen(true)}>Portfolio Details</CTA></ScrollView><PortfolioDetailsModal visible={detailsOpen} onClose={()=>setDetailsOpen(false)} account={account} holdings={holdings}/></Page>
}
const styles=StyleSheet.create({body:{backgroundColor:"#08111F"}});
