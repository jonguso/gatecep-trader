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

const horizons=[

"<1 Year",
"1-5 Years",
"5-10 Years",
"10+ Years"

];

export default function Horizon(){

async function choose(h){

await saveProfile({
timeHorizon:h
});

router.push(
"/onboarding/risk"
);

}

return(

<View style={styles.screen}>

<Text style={styles.title}>
When do you need your money?
</Text>

{

horizons.map(item=>(

<Pressable
key={item}
style={styles.card}
onPress={()=>choose(item)}
>

<Text style={styles.text}>
{item}
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