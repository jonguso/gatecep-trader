import { router } from "expo-router";
import {
View,
Text,
Pressable,
StyleSheet
} from "react-native";

import { saveProfile }
from "../../src/utils/onboardingStorage";

const goals=[

"Build Wealth",
"Retirement",
"Kids Education",
"Need Guidance"

];

export default function Goal(){

async function choose(goal){

await saveProfile({
goal
});

router.push(
"/onboarding/experience"
);

}

return(

<View style={styles.screen}>

<Text style={styles.title}>
What are you investing for?
</Text>

{

goals.map(g=>(

<Pressable
key={g}
style={styles.card}
onPress={()=>choose(g)}
>

<Text style={styles.text}>
{g}
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
padding:22,
borderRadius:18,
marginBottom:14
},

text:{
color:"white",
fontWeight:"800"
}

});