import { View, Text, Pressable, StyleSheet } from "react-native";

export default function LinkedBrokerCard({ broker, linked, onLink, onSignup }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.logo}><Text style={styles.logoText}>{broker.shortName}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{broker.name}</Text>
          <Text style={styles.meta}>{broker.market} · {broker.status}</Text>
          <Text style={linked ? styles.linked : styles.notLinked}>
            {linked ? `Linked · ${linked.accountNumber}` : "Not linked"}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onLink} style={styles.primary}>
          <Text style={styles.primaryText}>{linked ? "Manage" : "Link Account"}</Text>
        </Pressable>
        <Pressable onPress={onSignup} style={styles.secondary}>
          <Text style={styles.secondaryText}>Sign Up Form</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:{backgroundColor:"#111D35",borderRadius:16,padding:14,borderWidth:1,borderColor:"rgba(148,163,184,.22)",marginBottom:12},
  row:{flexDirection:"row",alignItems:"center",gap:12},
  logo:{width:52,height:52,borderRadius:14,backgroundColor:"#0B5CFF",alignItems:"center",justifyContent:"center"},
  logoText:{color:"#fff",fontWeight:"900"},
  name:{color:"#fff",fontWeight:"900",fontSize:16},
  meta:{color:"#94A3B8",marginTop:4},
  linked:{color:"#22C55E",fontWeight:"800",marginTop:4},
  notLinked:{color:"#FBBF24",fontWeight:"800",marginTop:4},
  actions:{flexDirection:"row",gap:8,marginTop:14},
  primary:{flex:1,backgroundColor:"#0B5CFF",minHeight:42,borderRadius:8,alignItems:"center",justifyContent:"center"},
  primaryText:{color:"#fff",fontWeight:"900"},
  secondary:{flex:1,borderWidth:1,borderColor:"#38BDF8",minHeight:42,borderRadius:8,alignItems:"center",justifyContent:"center"},
  secondaryText:{color:"#38BDF8",fontWeight:"900"}
});
