import React, { useState } from "react";
import {
 View,
 Text,
 TextInput,
 Pressable,
 StyleSheet,
 ScrollView
} from "react-native";

import { router } from "expo-router";

export default function Signup() {

 const [form,setForm]=useState({
   email:"",
   phone:"",
   password:"",
   confirm:""
 });

 function signup(){

   if(form.password!==form.confirm){

     alert("Passwords do not match");

     return;
   }

   /*
   backend signup later
   */

   router.replace("/login");
 }

 return (

<ScrollView
style={styles.screen}
contentContainerStyle={styles.content}
>

<Text style={styles.title}>

Create Account

</Text>

<Text style={styles.subtitle}>

Start building your investment profile.

</Text>

<Input
placeholder="Email"
value={form.email}
onChangeText={(v)=>
setForm({
...form,
email:v
})
}
/>

<Input
placeholder="Phone Number"
value={form.phone}
onChangeText={(v)=>
setForm({
...form,
phone:v
})
}
/>

<Input
placeholder="Password"
secureTextEntry
value={form.password}
onChangeText={(v)=>
setForm({
...form,
password:v
})
}
/>

<Input
placeholder="Confirm Password"
secureTextEntry
value={form.confirm}
onChangeText={(v)=>
setForm({
...form,
confirm:v
})
}
/>

<Pressable
style={styles.button}
onPress={signup}
>

<Text style={styles.buttonText}>

Create Account

</Text>

</Pressable>

<Pressable style={styles.secondary} onPress={() => router.replace("/login")}>
<Text style={styles.login}>

Already have account? Login

</Text>

</Pressable>

</ScrollView>

 );
}

function Input(props){

return(

<TextInput

{...props}

placeholderTextColor="#64748b"

style={styles.input}

/>

);

}

const styles=StyleSheet.create({

screen:{
flex:1,
backgroundColor:"#020617"
},

content:{
padding:24,
paddingTop:80
},

title:{
fontSize:34,
fontWeight:"900",
color:"white"
},

subtitle:{
color:"#94a3b8",
marginTop:10,
marginBottom:30
},

input:{
backgroundColor:"#0f172a",
borderWidth:1,
borderColor:"#1e293b",
padding:16,
borderRadius:18,
marginBottom:14,
color:"white"
},

button:{
backgroundColor:"#9333ea",
padding:18,
borderRadius:18,
marginTop:12
},

buttonText:{
color:"white",
textAlign:"center",
fontWeight:"900"
},

login:{
color:"#67e8f9",
textAlign:"center",
marginTop:24
}

});