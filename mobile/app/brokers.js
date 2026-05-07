import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import API from "../src/api";
import { FALLBACK_BROKERS } from "../src/data/brokers";
import LinkedBrokerCard from "../src/components/LinkedBrokerCard";

export default function Brokers() {
  const [brokers, setBrokers] = useState(FALLBACK_BROKERS);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");

  const load = async () => {
    try {
      const [b, l] = await Promise.all([API.get("/brokers"), API.get("/brokers/user/u1")]);
      setBrokers(b.data?.data || FALLBACK_BROKERS);
      setLinkedAccounts(l.data?.data || []);
    } catch {
      setBrokers(FALLBACK_BROKERS);
    }
  };

  useEffect(() => { load(); }, []);

  const linkedFor = (brokerId) => linkedAccounts.find(x => x.brokerId === brokerId);

  const openSignup = async (broker) => {
    if (!broker.signupUrl) {
      Alert.alert("Coming Soon", `${broker.name} sign-up link will be added.`);
      return;
    }
    await Linking.openURL(broker.signupUrl);
  };

  const saveLink = async () => {
    if (!selectedBroker || !accountNumber.trim()) {
      Alert.alert("Missing Account", "Enter broker account number.");
      return;
    }

    try {
      const res = await API.post(`/brokers/user/u1/link`, {
        brokerId: selectedBroker.id,
        accountNumber: accountNumber.trim()
      });

      setLinkedAccounts(prev => [...prev.filter(x => x.brokerId !== selectedBroker.id), res.data]);
    } catch {
      setLinkedAccounts(prev => [...prev.filter(x => x.brokerId !== selectedBroker.id), {
        brokerId: selectedBroker.id,
        brokerName: selectedBroker.name,
        brokerShortName: selectedBroker.shortName,
        accountNumber: accountNumber.trim(),
        status: "LINKED"
      }]);
    }

    setSelectedBroker(null);
    setAccountNumber("");
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </Pressable>
        <View>
          <Text style={styles.title}>Brokers</Text>
          <Text style={styles.subtitle}>Link multiple NSE brokers in one app</Text>
        </View>
      </View>

      <ScrollView style={styles.body}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Gatecep Multi-Broker Layer</Text>
          <Text style={styles.infoText}>
            Connect AIB, ABC, and other NSE brokers. Coach G will later recommend the best broker for routing.
          </Text>
        </View>

        {selectedBroker && (
          <View style={styles.linkBox}>
            <Text style={styles.linkTitle}>Link {selectedBroker.shortName}</Text>
            <TextInput
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Broker account number"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
            <View style={styles.linkActions}>
              <Pressable onPress={() => setSelectedBroker(null)} style={styles.cancelBtn}><Text style={styles.cancelText}>Cancel</Text></Pressable>
              <Pressable onPress={saveLink} style={styles.saveBtn}><Text style={styles.saveText}>Link Broker</Text></Pressable>
            </View>
          </View>
        )}

        {brokers.map(broker => (
          <LinkedBrokerCard
            key={broker.id}
            broker={broker}
            linked={linkedFor(broker.id)}
            onLink={() => setSelectedBroker(broker)}
            onSignup={() => openSignup(broker)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page:{flex:1,backgroundColor:"#08111F"},
  header:{backgroundColor:"#06154A",paddingTop:42,paddingBottom:18,paddingHorizontal:16,flexDirection:"row",alignItems:"center",gap:14},
  back:{width:36,height:36,justifyContent:"center"},
  title:{color:"#fff",fontSize:24,fontWeight:"900"},
  subtitle:{color:"#CBD5E1",marginTop:3},
  body:{padding:16},
  infoCard:{backgroundColor:"#111D35",borderRadius:16,padding:16,borderWidth:1,borderColor:"rgba(148,163,184,.22)",marginBottom:14},
  infoTitle:{color:"#fff",fontSize:17,fontWeight:"900"},
  infoText:{color:"#CBD5E1",lineHeight:20,marginTop:8},
  linkBox:{backgroundColor:"#16233F",borderRadius:16,padding:16,marginBottom:14},
  linkTitle:{color:"#fff",fontSize:18,fontWeight:"900"},
  input:{minHeight:48,borderWidth:1,borderColor:"rgba(148,163,184,.28)",borderRadius:10,color:"#fff",paddingHorizontal:12,marginTop:12},
  linkActions:{flexDirection:"row",gap:10,marginTop:12},
  cancelBtn:{flex:1,borderWidth:1,borderColor:"#94A3B8",minHeight:44,borderRadius:8,alignItems:"center",justifyContent:"center"},
  cancelText:{color:"#CBD5E1",fontWeight:"900"},
  saveBtn:{flex:1,backgroundColor:"#0B5CFF",minHeight:44,borderRadius:8,alignItems:"center",justifyContent:"center"},
  saveText:{color:"#fff",fontWeight:"900"}
});
