import React, { useEffect, useState } from "react";
import {
View,
Text,
ScrollView,
StyleSheet,
Pressable
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function CoachInsights(){

const [decision,setDecision]=useState(null);
const [actions,setActions]=useState([]);
const [alerts,setAlerts]=useState([]);

useEffect(()=>{
load();
},[]);

async function load(){

const decisionRaw=
await AsyncStorage.getItem(
"gatecepLatestCoachDecision"
);

const actionsRaw=
await AsyncStorage.getItem(
"gatecepLatestCoachActions"
);

const alertsRaw=
await AsyncStorage.getItem(
"gatecepLatestAlerts"
);

if(decisionRaw){

setDecision(
JSON.parse(decisionRaw)
);

}

if(actionsRaw){

setActions(
JSON.parse(actionsRaw)
);

}

if(alertsRaw){

setAlerts(
JSON.parse(alertsRaw)
);

}

}

return(

<ScrollView
style={styles.screen}
contentContainerStyle={
styles.content
}
>

<Text style={styles.title}>
Coach G Insights
</Text>

<Text style={styles.subtitle}>
AI recommendations and portfolio intelligence
</Text>

<View style={styles.card}>

<Text style={styles.cardTitle}>
Recommendation
</Text>

<Text style={styles.bigText}>
{decision?.recommendation ||
"No recommendation available"}
</Text>

<Text style={styles.body}>
Confidence:
{" "}
{decision?.confidence || 0}%
</Text>

</View>

<View style={styles.card}>

<Text style={styles.cardTitle}>
Why Coach G Thinks This
</Text>

{

decision?.reasons?.length
?

decision.reasons.map(
(reason,index)=>(
<Text
key={index}
style={styles.body}
>

• {reason}

</Text>
))
:

<Text style={styles.body}>
No reasons available
</Text>

}

</View>

<View style={styles.card}>

<Text style={styles.cardTitle}>
Recommended Actions
</Text>

{

actions.length===0
?

<Text style={styles.body}>
No actions available
</Text>

:

actions.map((a)=>(

<Pressable
key={a.label}
style={styles.action}
onPress={()=>
router.push(a.route)
}
>

<Text style={styles.actionText}>
{a.label}
</Text>

</Pressable>

))

}

</View>

<View style={styles.card}>

<Text style={styles.cardTitle}>
Portfolio Alerts
</Text>

{

alerts.length===0
?

<Text style={styles.body}>
No alerts detected
</Text>

:

alerts.map(
(alert,index)=>(
<Text
key={index}
style={styles.body}
>

• {alert.message}

</Text>
))

}

</View>

<Pressable
style={styles.primary}
onPress={()=>
router.replace("/dashboard")
}
>

<Text style={styles.primaryText}>
Back To Dashboard
</Text>

</Pressable>

</ScrollView>

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

subtitle:{
color:"#94a3b8",
marginTop:10
},

card:{
marginTop:20,
backgroundColor:"#0f172a",
padding:20,
borderRadius:20
},

cardTitle:{
color:"#67e8f9",
fontSize:18,
fontWeight:"900"
},

bigText:{
color:"white",
fontSize:28,
fontWeight:"900",
marginTop:14
},

body:{
color:"#cbd5e1",
marginTop:10,
lineHeight:22
},

action:{
marginTop:12,
backgroundColor:"#9333ea",
padding:16,
borderRadius:14
},

actionText:{
color:"white",
fontWeight:"900",
textAlign:"center"
},

primary:{
marginTop:30,
backgroundColor:"#1e293b",
padding:18,
borderRadius:18
},

primaryText:{
color:"white",
fontWeight:"900",
textAlign:"center"
}

});