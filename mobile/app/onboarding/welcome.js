import { router } from "expo-router";
import {
View,
Text,
Pressable,
StyleSheet
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Welcome(){

return(

<View style={styles.screen}>

<Text style={styles.logo}>
  GATECEP
</Text>

<Text style={styles.title}>
  AI Investing Platform
</Text>

<Pressable
  style={styles.button}
  onPress={async () => {
    await AsyncStorage.setItem(
      "gatecepAuthUser",
      JSON.stringify({
        id: `USER-${Date.now()}`,
        authMode: "LOCAL_DEMO",
        createdAt: new Date().toISOString()
      })
    );

    await AsyncStorage.setItem(
      "gatecepIsLoggedIn",
      "true"
    );

    router.push("/onboarding/name");
  }}
>
  <Text style={styles.buttonText}>
    Create Account
  </Text>
</Pressable>

<Pressable
  style={styles.secondary}
  onPress={() => router.push("/login")}
>
  <Text style={styles.secondaryText}>
    Already have account?
  </Text>
</Pressable>

</View>

);

}

const styles=StyleSheet.create({

screen:{
flex:1,
backgroundColor:"#020617",
justifyContent:"center",
padding:30
},

logo:{
fontSize:48,
fontWeight:"900",
color:"#67e8f9"
},

title:{
fontSize:26,
fontWeight:"800",
color:"white",
marginTop:10,
marginBottom:40
},

button:{
backgroundColor:"#22d3ee",
padding:20,
borderRadius:20
},

buttonText:{
textAlign:"center",
fontWeight:"900"
},

secondary:{
marginTop:20
},

secondaryText:{
color:"#94a3b8",
textAlign:"center"
}

});