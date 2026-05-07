import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GatecepLogo from "../src/components/GatecepLogo";
import { useAuth } from "../src/auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Login Required", "Enter email username and password.");
      return;
    }

    setBusy(true);
    try {
      await login({ username: username.trim().toLowerCase(), password });
      router.replace("/(tabs)/dashboard");
    } catch (err) {
      Alert.alert("Login Failed", err.response?.data?.error || "Invalid username or password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <GatecepLogo />
      <Text style={styles.title}>Online Trading Login</Text>

      <Text style={styles.label}>Email / User Name</Text>
      <TextInput value={username} onChangeText={setUsername} autoCapitalize="none" keyboardType="email-address" style={styles.input} />

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordBox}>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry={!showPassword} style={styles.passwordInput} />
        <Pressable onPress={() => setShowPassword(v => !v)}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#94A3B8" />
        </Pressable>
      </View>

      <View style={styles.linksRow}>
        <Text style={styles.link}>Forgot Password?</Text>
        <Text style={styles.link}>Unlock My Account</Text>
      </View>

      <Pressable onPress={submit} style={styles.primary}>
        <Text style={styles.primaryText}>{busy ? "LOGIN..." : "LOGIN"}</Text>
      </Pressable>

      <Text style={styles.terms}>
        By logging in and utilizing our platform, you agree to our updated terms and conditions of service.
        <Text style={styles.link}> Click here to review</Text>
      </Text>

      <Text style={styles.centerText}>Already have a trading account but no login?</Text>
      <Text style={styles.centerText}>Sign up below</Text>

      <Pressable onPress={() => router.push("/signup")} style={styles.secondary}>
        <Text style={styles.secondaryText}>SIGN UP</Text>
      </Pressable>

      <Text style={styles.linkCenter}>Open New Trading Account</Text>
      <Text style={styles.linkCenterBottom}>Follow Us On Social Media</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page:{flex:1,backgroundColor:"#fff"},
  content:{paddingHorizontal:34,paddingTop:54,paddingBottom:40},
  title:{color:"#111827",textAlign:"center",fontSize:20,fontWeight:"900",marginTop:46,marginBottom:38},
  label:{color:"#6B7280",fontWeight:"700",marginBottom:8},
  input:{borderWidth:1,borderColor:"#E5E7EB",minHeight:56,paddingHorizontal:12,color:"#111827",marginBottom:22},
  passwordBox:{borderWidth:1,borderColor:"#E5E7EB",minHeight:56,paddingHorizontal:12,marginBottom:18,flexDirection:"row",alignItems:"center"},
  passwordInput:{flex:1,color:"#111827"},
  linksRow:{flexDirection:"row",justifyContent:"space-between",marginBottom:24},
  link:{color:"#0878BF",textDecorationLine:"underline",fontWeight:"700"},
  primary:{backgroundColor:"#0878BF",minHeight:56,alignItems:"center",justifyContent:"center",borderRadius:4},
  primaryText:{color:"#fff",fontWeight:"900",fontSize:20},
  terms:{color:"#111827",textAlign:"center",lineHeight:20,marginVertical:24},
  centerText:{color:"#111827",textAlign:"center",lineHeight:24},
  secondary:{marginTop:18,borderWidth:2,borderColor:"#0878BF",minHeight:56,alignItems:"center",justifyContent:"center",borderRadius:4},
  secondaryText:{color:"#0878BF",fontWeight:"900",fontSize:20},
  linkCenter:{color:"#0878BF",textAlign:"center",textDecorationLine:"underline",fontWeight:"900",marginTop:24},
  linkCenterBottom:{color:"#0878BF",textAlign:"center",textDecorationLine:"underline",fontWeight:"900",marginTop:80}
});
