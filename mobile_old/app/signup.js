import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import GatecepLogo from "../src/components/GatecepLogo";
import { useAuth } from "../src/auth/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const [tradingAccount, setTradingAccount] = useState("");
  const [clientIdType, setClientIdType] = useState("National ID");
  const [clientId, setClientId] = useState("");
  const [email, setEmail] = useState("");
  const [createdCustomer, setCreatedCustomer] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!tradingAccount.trim() || !clientId.trim() || !email.trim()) {
      Alert.alert("Missing Information", "Enter trading account number, client ID, and email.");
      return;
    }

    setBusy(true);
    try {
      const customer = await signup({
        tradingAccount,
        clientIdType,
        clientId,
        email: email.trim().toLowerCase()
      });
      setCreatedCustomer(customer);
    } catch (err) {
      Alert.alert("Sign Up Failed", err.response?.data?.error || "Could not create customer.");
    } finally {
      setBusy(false);
    }
  };

  const goLogin = () => {
    setCreatedCustomer(null);
    router.replace("/login");
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <GatecepLogo />
        <Pressable onPress={() => router.back()}><Text style={styles.close}>×</Text></Pressable>
      </View>

      <Text style={styles.title}>Sign Up</Text>

      <Text style={styles.label}>Trading Account No.</Text>
      <TextInput value={tradingAccount} onChangeText={setTradingAccount} placeholder="Enter CDSC acc. no. / CBKCDS acc. no. / Client code" placeholderTextColor="#C7CDD8" style={styles.input} />

      <Text style={styles.label}>Client ID</Text>
      <View style={styles.segment}>
        {["National ID", "Passport", "In Corporation No."].map(x => (
          <Pressable key={x} onPress={() => setClientIdType(x)} style={[styles.segmentBtn, clientIdType === x && styles.segmentActive]}>
            <Text style={[styles.segmentText, clientIdType === x && styles.segmentTextActive]}>{x}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput value={clientId} onChangeText={setClientId} placeholder={`Enter ${clientIdType}`} placeholderTextColor="#C7CDD8" style={styles.input} />

      <Text style={styles.label}>Email ID</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="e.g.guest@gmail.com" placeholderTextColor="#C7CDD8" autoCapitalize="none" keyboardType="email-address" style={styles.input} />

      <Pressable onPress={submit} style={styles.primary}>
        <Text style={styles.primaryText}>{busy ? "SUBMITTING..." : "SUBMIT"}</Text>
      </Pressable>

      <Text style={styles.centerText}>Already have an account?</Text>
      <Pressable onPress={() => router.push("/login")} style={styles.secondary}><Text style={styles.secondaryText}>LOGIN</Text></Pressable>

      <Modal visible={!!createdCustomer} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Customer Created</Text>
            <Text style={styles.modalText}>Your GATECEP customer number has been created.</Text>
            <Text style={styles.customerNumber}>{createdCustomer?.customerNumber}</Text>
            <Text style={styles.modalText}>Username: {createdCustomer?.username}</Text>
            <Text style={styles.modalText}>Temporary password has been sent to your email.</Text>
            {createdCustomer?.devPassword ? <Text style={styles.devPassword}>Dev password: {createdCustomer.devPassword}</Text> : null}
            <Pressable onPress={goLogin} style={styles.primary}><Text style={styles.primaryText}>GO TO LOGIN</Text></Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page:{flex:1,backgroundColor:"#fff"},
  content:{paddingHorizontal:34,paddingTop:42,paddingBottom:40},
  topRow:{alignItems:"center"},
  close:{position:"absolute",right:-120,top:-20,color:"#111827",fontSize:30},
  title:{color:"#111827",fontSize:22,fontWeight:"900",textAlign:"center",marginTop:56,marginBottom:44},
  label:{color:"#6B7280",fontWeight:"700",marginBottom:8},
  input:{borderWidth:1,borderColor:"#E5E7EB",minHeight:56,paddingHorizontal:12,color:"#111827",marginBottom:22},
  segment:{flexDirection:"row",borderWidth:1,borderColor:"#E5E7EB",marginBottom:22},
  segmentBtn:{flex:1,minHeight:56,alignItems:"center",justifyContent:"center",borderRightWidth:1,borderRightColor:"#E5E7EB"},
  segmentActive:{backgroundColor:"#BFE3FF"},
  segmentText:{color:"#111827",fontWeight:"700",textAlign:"center"},
  segmentTextActive:{color:"#0878BF",fontWeight:"900"},
  primary:{backgroundColor:"#0878BF",minHeight:56,alignItems:"center",justifyContent:"center",borderRadius:4,marginTop:4},
  primaryText:{color:"#fff",fontWeight:"900",fontSize:20},
  centerText:{textAlign:"center",color:"#111827",marginTop:34,marginBottom:16},
  secondary:{borderWidth:2,borderColor:"#0878BF",minHeight:56,alignItems:"center",justifyContent:"center",borderRadius:4},
  secondaryText:{color:"#0878BF",fontWeight:"900",fontSize:20},
  modalBackdrop:{flex:1,backgroundColor:"rgba(0,0,0,.62)",justifyContent:"center",padding:24},
  modal:{backgroundColor:"#fff",borderRadius:16,padding:22},
  modalTitle:{color:"#111827",fontSize:22,fontWeight:"900",textAlign:"center"},
  modalText:{color:"#334155",textAlign:"center",marginTop:12,lineHeight:20},
  customerNumber:{color:"#0878BF",fontSize:24,fontWeight:"900",textAlign:"center",marginVertical:20},
  devPassword:{color:"#B45309",textAlign:"center",fontWeight:"900",marginVertical:10}
});
