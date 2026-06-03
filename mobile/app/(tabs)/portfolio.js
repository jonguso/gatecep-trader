import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

export default function Portfolio(){

const [holdings,setHoldings]=useState([]);

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

const totalValue=
useMemo(()=>{

return holdings.reduce(
(sum,h)=>
sum+
Number(
h.marketValue||
h.value||
0
),
0
);

},[holdings]);

const totalPL=
useMemo(()=>{

return holdings.reduce(
(sum,h)=>
sum+
Number(
h.profitLoss||
0
),
0
);

},[holdings]);

return(

<ScrollView
style={styles.screen}
contentContainerStyle={
styles.content
}
>

<View style={styles.topBar}>

<Pressable
style={styles.icon}
onPress={()=>
router.push("/menu")
}
>

<Text style={styles.iconText}>
☰
</Text>

</Pressable>

<Text style={styles.title}>
Portfolio
</Text>

<Pressable
style={styles.icon}
>

<Text>
🔔
</Text>

</Pressable>

</View>

<View style={styles.card}>

<Text style={styles.metricLabel}>
Total Holdings
</Text>

<Text style={styles.metric}>
KES {money(totalValue)}
</Text>

<Text style={styles.metricLabel}>
Profit / Loss
</Text>

<Text
style={
totalPL>=0
?
styles.green
:
styles.red
}
>

KES {money(totalPL)}

</Text>

</View>

<View style={styles.card}>

<Text style={styles.section}>
Holdings
</Text>

{

holdings.map(h=>(

<View
key={h.symbol}
style={styles.row}
>

<View>

<Text style={styles.symbol}>
{h.symbol}
</Text>

<Text style={styles.sector}>
{h.sector}
</Text>

</View>

<View>

<Text style={styles.white}>
{money(
h.marketValue||
h.value
)}
</Text>

<Text
style={
Number(
h.profitLoss||0
)>=0
?
styles.green
:
styles.red
}
>

{money(
h.profitLoss
)}

</Text>

</View>

</View>

))

}

</View>

<Pressable
style={styles.primary}
onPress={()=>
router.push(
"/import-portfolio"
)
}
>

<Text style={styles.primaryText}>
Import Portfolio
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

topBar:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

icon:{
width:42,
height:42,
borderRadius:14,
backgroundColor:"#1e293b",
justifyContent:"center",
alignItems:"center"
},

iconText:{
color:"white",
fontSize:22
},

title:{
color:"white",
fontSize:32,
fontWeight:"900"
},

card:{
marginTop:20,
padding:18,
borderRadius:20,
backgroundColor:"#0f172a"
},

metricLabel:{
color:"#94a3b8"
},

metric:{
color:"#67e8f9",
fontSize:28,
fontWeight:"900"
},

section:{
color:"#67e8f9",
fontWeight:"900"
},

row:{
flexDirection:"row",
justifyContent:"space-between",
paddingVertical:14,
borderTopWidth:1,
borderTopColor:"#1e293b"
},

symbol:{
color:"white",
fontWeight:"900"
},

sector:{
color:"#94a3b8"
},

white:{
color:"white"
},

green:{
color:"#86efac"
},

red:{
color:"#fca5a5"
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