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

export default function Funds() {

  const [portfolio,setPortfolio]=useState([]);

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

  const holdingsValue=
  useMemo(()=>{

    return portfolio.reduce(

      (sum,h)=>

        sum+

        Number(

          h.marketValue||

          h.value||

          0

        ),

      0

    );

  },[portfolio]);

  const estimatedCash=
  useMemo(()=>{

    return holdingsValue*0.12;

  },[holdingsValue]);

  const liquidityRatio=
  useMemo(()=>{

    if(
      holdingsValue===0
    ) return 0;

    return (
      estimatedCash/
      holdingsValue
    )*100;

  },[
    estimatedCash,
    holdingsValue
  ]);

  return(

<ScrollView
style={styles.screen}
contentContainerStyle={styles.content}
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
Funds
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
Available Cash
</Text>

<Text style={styles.metric}>

KES {money(
estimatedCash
)}

</Text>

<Text style={styles.small}>

Estimated from portfolio profile

</Text>

</View>

<View style={styles.grid}>

<Metric
label="Portfolio Value"
value={
`KES ${money(
holdingsValue
)}`
}
/>

<Metric
label="Liquidity"
value={
`${liquidityRatio.toFixed(1)}%`
}
/>

<Metric
label="Cash Status"
value={
liquidityRatio<10
?
"Low"
:
"Healthy"
}
/>

<Metric
label="Funding"
value="Manual"
/>

</View>

<View style={styles.card}>

<Text style={styles.section}>

Cash Guidance

</Text>

<Text style={styles.body}>

Coach G recommends keeping enough liquidity for opportunities while avoiding excessive idle cash.

</Text>

<Text style={styles.body}>

Current cash profile:

{liquidityRatio<10
?
" Low liquidity. Consider reserving more cash."
:
" Healthy liquidity profile."
}

</Text>

</View>

<Pressable
style={styles.primary}
>

<Text style={styles.primaryText}>

Deposit Funds

</Text>

</Pressable>

<Pressable
style={styles.secondary}
>

<Text style={styles.secondaryText}>

Withdraw Funds

</Text>

</Pressable>

</ScrollView>

)

}

function Metric({
label,
value
}){

return(

<View style={styles.metricBox}>

<Text style={styles.metricBoxLabel}>
{label}
</Text>

<Text style={styles.metricBoxValue}>
{value}
</Text>

</View>

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
fontSize:32,
fontWeight:"900",
color:"white"
},

card:{
marginTop:20,
backgroundColor:"#0f172a",
padding:18,
borderRadius:20
},

metricLabel:{
color:"#94a3b8"
},

metric:{
fontSize:30,
fontWeight:"900",
color:"#67e8f9"
},

small:{
color:"#94a3b8",
marginTop:6
},

grid:{
marginTop:20,
flexDirection:"row",
flexWrap:"wrap",
gap:10
},

metricBox:{
width:"47%",
backgroundColor:"#0f172a",
padding:16,
borderRadius:18
},

metricBoxLabel:{
color:"#94a3b8",
fontSize:12
},

metricBoxValue:{
marginTop:8,
color:"white",
fontWeight:"900"
},

section:{
color:"#67e8f9",
fontWeight:"900"
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
},

secondary:{
marginTop:12,
backgroundColor:"#1e293b",
padding:16,
borderRadius:16
},

secondaryText:{
color:"#67e8f9",
fontWeight:"900",
textAlign:"center"
}

})