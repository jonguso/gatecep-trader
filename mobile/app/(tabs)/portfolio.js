import React, { useEffect, useMemo, useState } from "react";
import {
View,
Text,
ScrollView,
Pressable,
StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Portfolio(){

const [holdings,setHoldings]=useState([]);
const [expandedSector,setExpandedSector]=useState(null);

useEffect(()=>{
load();
},[]);

async function load(){

const raw=
await AsyncStorage.getItem(
"gatecepManualPortfolio"
);

if(raw){

setHoldings(
JSON.parse(raw)
);

}

}

const sectorRows=useMemo(()=>{

const grouped={};

holdings.forEach((h)=>{

const sector=
h.sector||
"Unknown";

if(!grouped[sector]){

grouped[sector]={
sector,
securities:[],
totalValue:0,
profitLoss:0
};

}

const value=
Number(
h.marketValue||
h.value||
0
);

const pl=
Number(
h.profitLoss||
0
);

grouped[sector]
.securities
.push(h);

grouped[sector]
.totalValue+=value;

grouped[sector]
.profitLoss+=pl;

});

return Object.values(grouped)
.sort(
(a,b)=>
b.totalValue-
a.totalValue
);

},[holdings]);

const totalValue=
sectorRows.reduce(
(sum,s)=>
sum+s.totalValue,
0
);

const totalPL=
sectorRows.reduce(
(sum,s)=>
sum+s.profitLoss,
0
);

return(

<ScrollView
style={styles.screen}
contentContainerStyle={
styles.content
}
>

<Text style={styles.title}>
Portfolio
</Text>

<View style={styles.summary}>

<View>

<Text style={styles.small}>
Total Holdings
</Text>

<Text style={styles.big}>
KES {money(totalValue)}
</Text>

</View>

<View>

<Text style={styles.small}>
Profit / Loss
</Text>

<Text
style={
totalPL>=0
?styles.green
:styles.red
}
>

KES {money(totalPL)}

</Text>

</View>

</View>

{

sectorRows.map(
(sector)=>{

const expanded=
expandedSector===
sector.sector;

const weight=
totalValue>0
?
(
sector.totalValue/
totalValue
)*100
:
0;

return(

<View
key={sector.sector}
style={styles.card}
>

<Pressable
onPress={()=>{

setExpandedSector(

expanded
?null
:sector.sector

);

}}
>

<View style={styles.row}>

<View>

<Text style={styles.sectorTitle}>
{sector.sector}
</Text>

<Text style={styles.small}>

{sector.securities.length}
 securities •
 {weight.toFixed(2)}%

</Text>

</View>

<View>

<Text style={styles.value}>

KES {money(
sector.totalValue
)}

</Text>

<Text
style={
sector.profitLoss>=0
?styles.green
:styles.red
}
>

KES {money(
sector.profitLoss
)}

</Text>

</View>

</View>

</Pressable>

{

expanded &&

sector.securities.map(
(sec,index)=>(

<View
key={index}
style={styles.security}
>

<View style={styles.row}>

<View>

<Text style={styles.symbol}>
{sec.symbol}
</Text>

<Text style={styles.small}>
{sector.sector}
</Text>

</View>

<Text
style={
Number(
sec.profitLoss
)>=0
?
styles.green
:
styles.red
}
>

KES {
money(
sec.profitLoss
)
}

</Text>

</View>

<View style={styles.grid}>

<Info
label="Qty"
value={
Number(
sec.quantity||0
).toLocaleString()
}
/>

<Info
label="Price"
value={`KES ${
money(
sec.marketPrice||
sec.price
)
}`}
/>

<Info
label="Value"
value={`KES ${
money(
sec.marketValue||
sec.value
)
}`}
/>

<Info
label="Return"

value={`${
Number(
sec.changePct||
0
).toFixed(2)
}%`}

valueStyle={
Number(
sec.changePct
)>=0
?
styles.green
:
styles.red
}

/>

</View>

</View>

))

}

</View>

);

}

)

}

</ScrollView>

);

}

function Info({
label,
value,
valueStyle
}){

return(

<View style={styles.info}>

<Text style={styles.small}>
{label}
</Text>

<Text style={valueStyle||styles.white}>
{value}
</Text>

</View>

);

}

function money(v){

return Number(
v||0
).toLocaleString(
undefined,
{
minimumFractionDigits:2,
maximumFractionDigits:2
}
);

}

const styles=StyleSheet.create({

screen:{
flex:1,
backgroundColor:"#020617"
},

content:{
padding:20,
paddingBottom:120
},

title:{
color:"white",
fontSize:34,
fontWeight:"900"
},

summary:{
marginTop:20,
backgroundColor:"#0f172a",
padding:20,
borderRadius:20,
flexDirection:"row",
justifyContent:"space-between"
},

card:{
marginTop:16,
backgroundColor:"#0f172a",
padding:18,
borderRadius:20
},

row:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

sectorTitle:{
color:"white",
fontSize:20,
fontWeight:"900"
},

symbol:{
color:"white",
fontWeight:"900",
fontSize:18
},

small:{
color:"#94a3b8",
marginTop:4
},

big:{
fontSize:38,
fontWeight:"900",
color:"#67e8f9"
},

value:{
color:"white",
fontWeight:"900",
textAlign:"right"
},

green:{
color:"#86efac",
fontWeight:"900"
},

red:{
color:"#fca5a5",
fontWeight:"900"
},

white:{
color:"white",
fontWeight:"900"
},

security:{
marginTop:14,
backgroundColor:"#020617",
padding:14,
borderRadius:18
},

grid:{
marginTop:14,
flexDirection:"row",
flexWrap:"wrap",
gap:10
},

info:{
width:"47%",
backgroundColor:"#0f172a",
padding:12,
borderRadius:12
}

});