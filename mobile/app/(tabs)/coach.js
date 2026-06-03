import React, { useMemo, useState, useEffect } from "react";
import {
 View,
 Text,
 ScrollView,
 Pressable,
 StyleSheet
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

const amounts=[5000,10000,25000,50000,100000];

export default function Coach(){

const [portfolio,setPortfolio]=useState([]);

const [goal,setGoal]=useState("balanced");

const [risk,setRisk]=useState("balanced");

const [amount,setAmount]=useState(10000);

useEffect(()=>{

load();

},[]);

async function load(){

const raw=
await AsyncStorage.getItem(
"gatecepManualPortfolio"
);

if(raw){

setPortfolio(
JSON.parse(raw)
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

const largest=
useMemo(()=>{

const sectors={};

portfolio.forEach(x=>{

const sector=
x.sector||
"Unknown";

const v=
Number(
x.marketValue||
x.value||
0
);

sectors[sector]=
(sectors[sector]||0)+v;

});

return Object.entries(
sectors
)
.sort(
(a,b)=>
b[1]-a[1]
)[0];

},[portfolio]);

function recommendation(){

if(!largest){

return "Build diversification first.";

}

if(
largest[0]==="Banking"
){

return "Avoid adding more Banking exposure. Prioritize underweight sectors.";

}

return `Largest exposure is ${largest[0]}. Add sectors that improve diversification.`;

}

return(

<ScrollView
style={styles.screen}
contentContainerStyle={styles.content}
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
{largest?.[0]||"N/A"}
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

amount===a &&
styles.chipActive

]}

onPress={()=>
setAmount(a)
}

>

<Text style={
amount===a
?
styles.chipTextActive
:
styles.chipText
}>

KES {a}

</Text>

</Pressable>

))

}

</View>

</View>

<View style={styles.card}>

<Text style={styles.section}>
Coach Recommendation
</Text>

<Text style={styles.body}>
{recommendation()}
</Text>

<Text style={styles.body}>

If you invest

KES {money(amount)}

Coach G suggests using new money to improve diversification rather than increase concentration.

</Text>

</View>

<Pressable
style={styles.primary}
>

<Text style={styles.primaryText}>
Run Simulation
</Text>

</Pressable>

</ScrollView>

)

}

function money(v){

return Number(
v||0
).toLocaleString(
undefined,
{
maximumFractionDigits:2
}
)

}

const styles=StyleSheet.create({

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
marginTop:20,
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

amountRow:{
flexDirection:"row",
flexWrap:"wrap",
gap:8,
marginTop:12
},

chip:{
padding:12,
borderRadius:999,
backgroundColor:"#1e293b"
},

chipActive:{
backgroundColor:"#9333ea"
},

chipText:{
color:"#cbd5e1"
},

chipTextActive:{
color:"white"
},

body:{
color:"#cbd5e1",
marginTop:12,
lineHeight:21
},

primary:{
marginTop:20,
backgroundColor:"#9333ea",
padding:18,
borderRadius:16
},

primaryText:{
color:"white",
fontWeight:"900",
textAlign:"center"
}

})