import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import API from "../src/api";
import { useAuth } from "../src/auth/AuthContext";

export default function AccountProfile() {
  const { user, logout } = useAuth();
  const [linkedBrokers, setLinkedBrokers] = useState([]);

  useEffect(() => {
    API.get("/brokers/user/u1")
      .then(r => setLinkedBrokers(r.data?.data || []))
      .catch(() => setLinkedBrokers([
        { brokerId:"aib", brokerName:"AIB-AXYS Africa", brokerShortName:"AIB", accountNumber:"AIB-DEMO-001", status:"LINKED" },
        { brokerId:"abc", brokerName:"ABC Capital", brokerShortName:"ABC", accountNumber:"ABC-DEMO-001", status:"LINKED" }
      ]));
  }, []);

  const signOut = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Account Profile</Text>
      </View>

      <ScrollView>
        <View style={styles.profileHero}>
          <Ionicons name="person-circle-outline" size={120} color="#B8B8B8" />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroName}>{user?.name || user?.username || "Gatecep User"}</Text>
            <Text style={styles.heroEmail}>{user?.email || user?.username || "user@gatecep.com"}</Text>
            <Text style={styles.customer}>{user?.customerNumber || "GTC-DEMO-000001"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GATECEP Account Details</Text>
          <ProfileRow label="Name" value={user?.name || user?.username || "Gatecep User"} />
          <ProfileRow label="Email" value={user?.email || user?.username || "user@gatecep.com"} rightLabel="Change Password" onRight={() => Alert.alert("Change Password", "Password change flow coming next.")} />
          <ProfileRow label="Customer Number" value={user?.customerNumber || "GTC-DEMO-000001"} />

          <Text style={styles.sectionTitle}>Linked Broker Accounts</Text>

          {linkedBrokers.map(b => (
            <View key={b.brokerId} style={styles.brokerCard}>
              <View style={styles.brokerLogo}>
                <Text style={styles.brokerLogoText}>{b.brokerShortName || b.brokerId?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.brokerName}>{b.brokerName}</Text>
                <Text style={styles.brokerAccount}>Account: {b.accountNumber}</Text>
                <Text style={styles.brokerStatus}>{b.status}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={26} color="#22C55E" />
            </View>
          ))}

          <Pressable onPress={() => router.push("/brokers")} style={styles.fullBtn}>
            <Text style={styles.fullBtnText}>Manage Brokers</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Trading Account Details</Text>

          <View style={styles.tradeRow}>
            <Text style={styles.tradeText}>Broker-mirrored trading enabled</Text>
            <Pressable onPress={() => router.push("/(tabs)/watchlist")} style={styles.startBtn}>
              <Text style={styles.startText}>Start Trading</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.push("/settings")} style={styles.fullBtn}>
            <Text style={styles.fullBtnText}>Settings</Text>
          </Pressable>

          <Pressable onPress={signOut} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function ProfileRow({ label, value, rightLabel, onRight }) {
  return (
    <View style={styles.profileRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      {!!rightLabel && (
        <Pressable onPress={onRight} style={styles.smallBtn}>
          <Text style={styles.smallBtnText}>{rightLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page:{flex:1,backgroundColor:"#252637"},
  header:{backgroundColor:"#252637",paddingTop:38,paddingBottom:18,paddingHorizontal:16,flexDirection:"row",alignItems:"center",gap:14},
  back:{width:36,height:36,justifyContent:"center"},
  headerTitle:{color:"#fff",fontSize:22,fontWeight:"900"},
  profileHero:{backgroundColor:"#3A3B50",minHeight:170,paddingHorizontal:22,flexDirection:"row",alignItems:"center",gap:16},
  heroName:{color:"#fff",fontSize:20,fontWeight:"900"},
  heroEmail:{color:"#CBD5E1",marginTop:5},
  customer:{color:"#38BDF8",fontWeight:"900",marginTop:8},
  section:{padding:16},
  sectionTitle:{color:"#1D9BFF",fontWeight:"900",marginTop:12,marginBottom:8},
  profileRow:{flexDirection:"row",alignItems:"center",borderBottomWidth:1,borderBottomColor:"#3A3B50",paddingVertical:10},
  value:{color:"#fff",fontSize:18},
  label:{color:"#9CA3AF",fontSize:15,marginTop:3},
  smallBtn:{backgroundColor:"#55576E",paddingHorizontal:12,paddingVertical:10,borderRadius:4},
  smallBtnText:{color:"#fff",fontWeight:"700"},
  brokerCard:{backgroundColor:"#111D35",borderRadius:14,padding:12,marginBottom:10,flexDirection:"row",alignItems:"center",gap:12,borderWidth:1,borderColor:"rgba(148,163,184,.22)"},
  brokerLogo:{width:48,height:48,borderRadius:12,backgroundColor:"#0B5CFF",alignItems:"center",justifyContent:"center"},
  brokerLogoText:{color:"#fff",fontWeight:"900"},
  brokerName:{color:"#fff",fontSize:16,fontWeight:"900"},
  brokerAccount:{color:"#CBD5E1",marginTop:3},
  brokerStatus:{color:"#22C55E",fontWeight:"900",marginTop:3},
  tradeRow:{borderBottomWidth:1,borderBottomColor:"#3A3B50",paddingVertical:14,flexDirection:"row",alignItems:"center"},
  tradeText:{color:"#fff",fontSize:16,flex:1},
  startBtn:{backgroundColor:"#3CA34A",paddingHorizontal:14,paddingVertical:12,borderRadius:4},
  startText:{color:"#fff",fontWeight:"900"},
  fullBtn:{backgroundColor:"#0B5CFF",minHeight:48,borderRadius:6,alignItems:"center",justifyContent:"center",marginTop:14},
  fullBtnText:{color:"#fff",fontWeight:"900"},
  signOutBtn:{borderWidth:1,borderColor:"#EF4444",minHeight:48,borderRadius:6,alignItems:"center",justifyContent:"center",marginTop:14},
  signOutText:{color:"#EF4444",fontWeight:"900"}
});
