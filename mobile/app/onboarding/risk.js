import { router } from "expo-router";

import {
View,
Text,
Pressable,
StyleSheet
} from "react-native";

import {
saveProfile
}
from "../../src/utils/onboardingStorage";

const risks=[

"Conservative",
"Balanced",
"Aggressive"

];

export default function Risk(){

async function choose(risk){

await saveProfile({
riskTolerance:risk
});

router.push(
"/onboarding/broker-question"
);

}

return(

<View style={styles.screen}>

<Text style={styles.title}>
Risk Preference
</Text>

{

risks.map(risk=>(

<Pressable
key={risk}
style={styles.card}
onPress={()=>choose(risk)}
>

<Text style={styles.text}>
{risk}
</Text>

</Pressable>

))

}

</View>

);

}

const styles=StyleSheet.create({

screen:{
flex:1,
backgroundColor:"#020617",
padding:25
},

title:{
fontSize:32,
fontWeight:"900",
color:"white",
marginTop:80,
marginBottom:30
},

card:{
backgroundColor:"#0f172a",
padding:20,
borderRadius:18,
marginBottom:14
},

text:{
color:"white"
}

});