import React, { useEffect, useMemo, useState } from "react";
import {
View,
Text,
ScrollView,
Pressable,
StyleSheet,
Modal
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

const amounts=[5000,10000,25000,50000,100000];

export default function Coach(){

const [portfolio,setPortfolio]=useState([]);
const [dashboardContext,setDashboardContext]=useState(null);

const [amount,setAmount]=useState(10000);

const [sectorPlan,setSectorPlan]=useState([]);

const [selectedSector,setSelectedSector]=useState(null);

useEffect(()=>{

load();

},[]);

async function load(){

const portfolioRaw=
await AsyncStorage.getItem(
"gatecepManualPortfolio"
);

const contextRaw=
await AsyncStorage.getItem(
"gatecepCoachContext"
);

if(portfolioRaw){

setPortfolio(
JSON.parse(portfolioRaw)
);

}

if(contextRaw){

setDashboardContext(
JSON.parse(contextRaw)
);

}

}

const value=
useMemo(()=>{

return portfolio.reduce(
(sum,x)=>
sum+
Number(
x.marketValue||
x.value||
0
),
0
);

},[portfolio]);

const largestSector=
dashboardContext?.largestSector||
"N/A";

function recommendation() {
  if (largestSector === "Banking") {
    return [
      { sector: "Industrial", weight: 30 },
      { sector: "Telecom", weight: 25 },
      { sector: "Consumer", weight: 20 },
      { sector: "ETF", weight: 15 },
      { sector: "Cash Reserve", weight: 10 }
    ];
  }

  return [
    { sector: "ETF", weight: 30 },
    { sector: "Telecom", weight: 25 },
    { sector: "Industrial", weight: 25 },
    { sector: "Cash Reserve", weight: 20 }
  ];
}

function simulate(){

const plan=
recommendation()
.map(x=>({

...x,

amount:
(amount*x.weight)/100

}));

setSectorPlan(plan);

}

async function saveRecommendation(){

const raw=
await AsyncStorage.getItem(
"gatecepRecommendationHistory"
);

const history=
raw
?
JSON.parse(raw)
:
[];

history.unshift({

savedAt:
new Date()
.toISOString(),

portfolioValue:value,

largestSector,

amount,

sectorPlan,

status:
"SAVED_NOT_EXECUTED"

});

await AsyncStorage.setItem(

"gatecepRecommendationHistory",

JSON.stringify(history)

);

// do NOT close modal automatically
return true;
}

function buildSectorDetails(
sector
){

const allocation=
sector.amount;

const mock = {
  Industrial: [
    ["EABL", 248, "Industrial exposure", "East African Breweries", 5.2],
    ["BAT", 520, "Consumer defensive", "BAT Kenya", 7.8],
    ["BAMB", 37, "Manufacturing exposure", "Bamburi Cement", 3.5]
  ],

  Telecom: [
    ["SCOM", 30.6, "Telecom exposure", "Safaricom", 4.7]
  ],

  Consumer: [
    ["CARB", 20, "Consumer demand", "Carbacid", 3.2],
    ["UNGA", 16, "Consumer staples", "Unga Group", 2.5]
  ],

  ETF: [
    ["ETF", 940, "Broad diversification", "Diversifier ETF", 4.0]
  ]
};

const stocks=
mock[
sector.sector
]||[];

const actionableStocks = stocks.filter(([, price]) => allocation >= price);

let investedTotal = 0;

const holdings = actionableStocks.map(([symbol, price, reason, name, dividendYield = 0]) => ({
  symbol,
  name: name || symbol,
  price,
  reason,
  dividendYield,
  qty: 0,
  invested: 0
}));

const perStockAllocation =
  holdings.length > 0 ? allocation / holdings.length : 0;

holdings.forEach((h) => {
  const qty = Math.floor(perStockAllocation / h.price);
  const invested = qty * h.price;

  h.qty += qty;
  h.invested += invested;
  investedTotal += invested;
});

let remaining = allocation - investedTotal;

let canStillBuy = true;

while (canStillBuy) {
  canStillBuy = false;

  const affordable = holdings
    .filter((h) => h.price <= remaining)
    .sort((a, b) => a.price - b.price);

  if (affordable.length > 0) {
    const buy = affordable[0];

    buy.qty += 1;
    buy.invested += buy.price;
    investedTotal += buy.price;
    remaining -= buy.price;

    canStillBuy = true;
  }
}

const finalHoldings = holdings.filter(
  (h) => h.qty > 0 && h.invested > 0
);

const expectedDividend = finalHoldings.reduce(
  (sum, h) => sum + h.invested * (Number(h.dividendYield || 0) / 100),
  0
);

return {
  holdings: finalHoldings,
  unused: remaining,
  investedTotal,
  expectedDividend
};

}

return(

<ScrollView
style={styles.screen}
contentContainerStyle={
styles.content
}
>

<Text style={styles.title}>
Coach G
</Text>

<View style={styles.card}>

<Text style={styles.label}>
Portfolio Value
</Text>

<Text style={styles.metric}>
KES {money(value)}
</Text>

<Text style={styles.label}>
Largest Exposure
</Text>

<Text style={styles.metric2}>
{largestSector}
</Text>

</View>

<View style={styles.card}>

<Text style={styles.section}>
Coach G Analysis Context
</Text>

<Text style={styles.body}>
Largest Sector:
{largestSector}
</Text>

<Text style={styles.body}>
Risk:
{dashboardContext?.risk}
</Text>

<Text style={styles.body}>
Cash:
KES {
money(
dashboardContext?.cash
)
}
</Text>

</View>

<View style={styles.card}>

<Text style={styles.section}>
Scenario Amount
</Text>

<View style={styles.amountRow}>

{

amounts.map(a=>(

<Pressable

key={a}

style={[

styles.chip,

amount===a&&
styles.chipActive

]}

onPress={()=>
setAmount(a)
}

>

<Text
style={
amount===a
?
styles.white
:
styles.gray
}
>

KES {a}

</Text>

</Pressable>

))

}

</View>

</View>

<View style={styles.card}>

<Text style={styles.section}>
Coach G Sector Plan
</Text>

<Text style={styles.body}>

Avoid adding more
{largestSector}
exposure.

</Text>

</View>

<Pressable
style={styles.primary}
onPress={simulate}
>

<Text style={styles.primaryText}>
Run Simulation
</Text>

</Pressable>

{
sectorPlan.length > 0 && (

<View style={styles.card}>

<Text style={styles.section}>
Recommended Sectors
</Text>

{
sectorPlan.map(
sector => (

<Pressable
key={sector.sector}
style={styles.planRow}
onPress={()=>{
if(sector.sector!=="Cash Reserve"){
setSelectedSector(sector);
}
}}
>

<View>

<Text style={styles.planTitle}>
{sector.sector}
</Text>

<Text style={styles.body}>
{sector.weight}% • KES {money(sector.amount)}
</Text>

</View>

<Text style={styles.link}>
{
sector.sector==="Cash Reserve"
?
"Reserved"
:
"Sector Details"
}
</Text>

</Pressable>

))
}

<Pressable
style={styles.secondary}
onPress={async()=>{

await saveRecommendation();

alert(
"Coach G strategy saved to profile successfully."
);

}}
>

<Text style={styles.primaryText}>
Save Strategy To Profile
</Text>

</Pressable>

</View>

)
}

<Modal
visible={
!!selectedSector
}
transparent
animationType="fade"
>

<View
style={
styles.overlay
}
>

<View
style={
styles.popup
}
>

{

selectedSector &&

(()=>{

const details=
buildSectorDetails(
selectedSector
);

return(

<>

<View style={styles.popupHeader}>
  <View>
    <Text style={styles.popupTitle}>{selectedSector.sector}</Text>

    <Text style={styles.body}>
      Allocation: KES {money(selectedSector.amount)}
    </Text>
  </View>

  <Pressable onPress={() => setSelectedSector(null)}>
    <Text style={styles.gray}>Close</Text>
  </Pressable>
</View>

<Text style={styles.section}>
  Holdings ({details.holdings.length} securities)
</Text>

{details.holdings.map((h) => (
  <View key={h.symbol} style={styles.stockRow}>
    <View>
      <Text style={styles.stockSymbol}>{h.symbol}</Text>
      <Text style={styles.stockName}>{h.name}</Text>
      <Text style={styles.stockReason}>{h.reason}</Text>
    </View>

    <View style={styles.stockRight}>

<Text style={styles.stockShares}>
{h.qty} shares
</Text>

<Text style={styles.marketPrice}>
@ KES {money(h.price)}
</Text>

<Text style={styles.stockValue}>
KES {money(h.invested)}
</Text>

</View>
  </View>
))}

<View style={styles.summaryStrip}>
  <View style={styles.summaryItem}>
    <Text style={styles.summaryLabel}>Invested</Text>
    <Text style={styles.summaryValue}>
      KES {money(selectedSector.amount - details.unused)}
    </Text>
  </View>

  <View style={styles.summaryItem}>
    <Text style={styles.summaryLabel}>Unused Cash</Text>
    <Text style={styles.summaryValueYellow}>
      KES {money(details.unused)}
    </Text>
  </View>

  <View style={styles.summaryItem}>
    <Text style={styles.summaryLabel}>Allocation</Text>
    <Text style={styles.summaryValue}>
      KES {money(selectedSector.amount)}
    </Text>
  </View>
</View>

<View style={styles.dividendBox}>
  <Text style={styles.summaryLabel}>Estimated Annual Dividend</Text>
  <Text style={styles.dividendValue}>
    KES {money(details.expectedDividend)}
  </Text>
</View>

{details.unused > 0 && (
  <View style={styles.unused}>
    <Text style={styles.white}>Unused Cash</Text>
    <Text style={styles.metric2}>KES {money(details.unused)}</Text>
    <Text style={styles.body}>
      KES {money(details.unused)} could not be efficiently invested and should
      remain in Cash.
    </Text>
  </View>
)}

<View style={styles.reasonBox}>
  <Text style={styles.body}>
    Coach G selected these securities because they fit this sector’s purpose
    and the available amount. Any amount that cannot buy full shares stays in
    Cash.
  </Text>
</View>

<View style={styles.compare}>
  <Text style={styles.section}>Before vs After</Text>
  <Text style={styles.body}>Largest Sector: 35%</Text>
  <Text style={styles.body}>Projected: 26%</Text>
</View>

</>

);

})()

}

</View>

</View>

</Modal>

</ScrollView>

)

}

function money(v){

return Number(
v||0
)
.toLocaleString(
undefined,
{
maximumFractionDigits:2
}
)

}

const styles=
StyleSheet.create({

screen:{
flex:1,
backgroundColor:"#020617"
},

content:{
padding:20,
paddingTop:60,
paddingBottom:120
},

title:{
fontSize:34,
fontWeight:"900",
color:"white"
},

card:{
marginTop:18,
padding:18,
backgroundColor:"#0f172a",
borderRadius:20
},

label:{
color:"#94a3b8"
},

metric:{
fontSize:30,
fontWeight:"900",
color:"#67e8f9"
},

metric2:{
fontSize:24,
fontWeight:"900",
color:"white"
},

section:{
color:"#67e8f9",
fontWeight:"900"
},

body:{
marginTop:8,
color:"#cbd5e1"
},

amountRow:{
flexDirection:"row",
flexWrap:"wrap",
gap:8,
marginTop:16
},

chip:{
padding:12,
borderRadius:999,
backgroundColor:"#1e293b"
},

chipActive:{
backgroundColor:"#9333ea"
},

white:{
color:"white"
},

gray:{
color:"#94a3b8"
},

primary:{
marginTop:20,
backgroundColor:"#9333ea",
padding:18,
borderRadius:16
},

secondary:{
marginTop:12,
backgroundColor:"#1e293b",
padding:18,
borderRadius:16
},

primaryText:{
color:"white",
fontWeight:"900",
textAlign:"center"
},

planRow:{
paddingVertical:18,
borderBottomWidth:1,
borderBottomColor:"#1e293b",
flexDirection:"row",
justifyContent:"space-between"
},

planTitle:{
color:"white",
fontWeight:"900"
},

link:{
color:"#67e8f9"
},

overlay:{
flex:1,
backgroundColor:"rgba(0,0,0,.65)",
justifyContent:"center",
padding:20
},

popup: {
  width: "94%",
  maxWidth: 620,
  maxHeight: "92%",
  backgroundColor: "#020617",
  padding: 20,
  borderRadius: 24,
  borderColor: "#0891b2",
  borderWidth: 1
},

popupHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start"
},

popupTitle: {
  fontSize: 24,
  fontWeight: "900",
  color: "#67e8f9"
},

stockRow: {
  marginTop: 12,
  padding: 14,
  backgroundColor: "#111827",
  borderRadius: 14,
  borderColor: "#1f2937",
  borderWidth: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  gap: 12
},

stockSymbol: {
  color: "white",
  fontSize: 16,
  fontWeight: "900"
},

stockName: {
  color: "#94a3b8",
  marginTop: 4
},

stockReason: {
  color: "#93c5fd",
  marginTop: 4,
  fontSize: 12
},

stockRight: {
  alignItems: "flex-end",
  minWidth: 90
},

stockShares: {
  color: "#67e8f9",
  fontWeight: "900"
},

stockValue: {
  color: "#cbd5e1",
  marginTop: 4
},

summaryStrip: {
  marginTop: 18,
  backgroundColor: "#111827",
  borderRadius: 16,
  padding: 14,
  flexDirection: "row",
  justifyContent: "space-between"
},

summaryItem: {
  flex: 1,
  alignItems: "center"
},

summaryLabel: {
  color: "#94a3b8",
  fontSize: 11
},

summaryValue: {
  color: "#67e8f9",
  fontWeight: "900",
  marginTop: 5
},

summaryValueYellow: {
  color: "#fde047",
  fontWeight: "900",
  marginTop: 5
},

unused: {
  marginTop: 16,
  padding: 16,
  borderRadius: 16,
  backgroundColor: "#1c1917",
  borderColor: "#854d0e",
  borderWidth: 1
},

reasonBox: {
  marginTop: 16,
  padding: 14,
  borderRadius: 16,
  backgroundColor: "#082f49",
  borderColor: "#075985",
  borderWidth: 1
},

dividendBox: {
  marginTop: 14,
  backgroundColor: "rgba(16,185,129,.10)",
  borderColor: "rgba(16,185,129,.45)",
  borderWidth: 1,
  borderRadius: 16,
  padding: 16
},

dividendValue: {
  color: "#86efac",
  fontSize: 24,
  fontWeight: "900",
  marginTop: 6
},

marketPrice:{
color:"#94a3b8",
fontSize:12,
marginTop:2
},

compare:{
marginTop:20
}

});