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

const levels=[

"Beginner",
"Intermediate",
"Advanced"

];

export default function Experience(){

async function choose(level){

await saveProfile({
experience:level
});

router.push(
"/onboarding/horizon"
);

}

return(

<View style={styles.screen}>

<Text style={styles.title}>
Investment Experience
</Text>

{

levels.map(level=>(

<Pressable
key={level}
style={styles.card}
onPress={()=>choose(level)}
>

<Text style={styles.text}>
{level}
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