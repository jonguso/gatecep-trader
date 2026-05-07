import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import GatecepLogo from "../src/components/GatecepLogo";
import { useAuth } from "../src/auth/AuthContext";

export default function Landing() {
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && user) {
      router.replace("/(tabs)/dashboard");
    }
  }, [ready, user]);

  if (!ready || user) {
    return null;
  }

  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <View style={styles.logoTop}><GatecepLogo dark /></View>
        <View style={styles.phone}>
          <Text style={styles.phoneTitle}>GATECEP</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Invested Value</Text>
            <Text style={styles.value}>KES 0.00</Text>
          </View>
          <View style={styles.tabs}>
            <Text style={styles.tab}>Gainers</Text>
            <Text style={styles.tab}>Losers</Text>
            <Text style={styles.tab}>Movers</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.dot} />
        <Text style={styles.title}>About GATECEP Trader</Text>
        <Text style={styles.subtitle}>Trade fast and securely with AI-assisted market insights.</Text>

        <View style={styles.buttons}>
          <Pressable onPress={() => router.push("/login")} style={styles.loginBtn}>
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/signup")} style={styles.signupBtn}>
            <Text style={styles.signupText}>SIGN UP</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.replace("/(tabs)/dashboard")}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page:{flex:1,backgroundColor:"#fff"},
  hero:{flex:1.25,backgroundColor:"#EAF3FF",alignItems:"center",justifyContent:"center"},
  logoTop:{position:"absolute",top:58,left:28},
  phone:{width:210,minHeight:330,borderRadius:28,backgroundColor:"#06154A",transform:[{rotate:"-10deg"}],padding:18,elevation:8},
  phoneTitle:{color:"#fff",fontWeight:"900",marginBottom:18},
  card:{backgroundColor:"#fff",borderRadius:10,padding:14,marginBottom:18},
  label:{color:"#64748B",fontSize:11},
  value:{color:"#111827",fontWeight:"900",fontSize:18,marginTop:4},
  tabs:{flexDirection:"row",gap:6},
  tab:{flex:1,backgroundColor:"#0B5CFF",color:"#fff",textAlign:"center",paddingVertical:8,borderRadius:6,fontSize:10,fontWeight:"900"},
  content:{paddingHorizontal:28,paddingBottom:24,paddingTop:10},
  dot:{alignSelf:"center",width:10,height:10,borderRadius:5,backgroundColor:"#22D3EE",marginBottom:80},
  title:{color:"#111827",fontSize:22,fontWeight:"900",textAlign:"center"},
  subtitle:{color:"#334155",textAlign:"center",marginTop:8,lineHeight:20},
  buttons:{flexDirection:"row",gap:14,marginTop:20},
  loginBtn:{flex:1,backgroundColor:"#0878BF",minHeight:52,borderRadius:4,alignItems:"center",justifyContent:"center"},
  loginText:{color:"#fff",fontWeight:"900",fontSize:18},
  signupBtn:{flex:1,backgroundColor:"#fff",borderWidth:2,borderColor:"#0878BF",minHeight:52,borderRadius:4,alignItems:"center",justifyContent:"center"},
  signupText:{color:"#0878BF",fontWeight:"900",fontSize:18},
  skip:{color:"#0878BF",textAlign:"right",marginTop:18,fontWeight:"900"}
});
