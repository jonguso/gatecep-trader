import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

export default function CoachGBrokerRecommendationModal({
  visible,
  recommendation,
  onAccept,
  onChangeBroker,
  onCancel
}) {
  const confidence = Number(recommendation?.confidence || 0);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Coach G Broker Recommendation</Text>
          <Text style={styles.subtitle}>Before final order confirmation</Text>

          <View style={styles.scoreBox}>
            <Text style={styles.score}>{confidence}%</Text>
            <Text style={styles.scoreLabel}>Confidence</Text>
          </View>

          <Text style={styles.broker}>{recommendation?.brokerName || "AIB-AXYS Africa"}</Text>
          <Text style={styles.account}>Account: {recommendation?.accountNumber || "AIB-DEMO-001"}</Text>
          <Text style={styles.status}>Routing: {recommendation?.routingStatus || "MOCK_READY"}</Text>

          <Text style={styles.message}>
            {recommendation?.recommendation || "Coach G recommends this broker based on linked account and routing readiness."}
          </Text>

          {(recommendation?.reasons || []).map((r, i) => (
            <Text key={i} style={styles.reason}>• {r}</Text>
          ))}

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onChangeBroker} style={styles.change}>
              <Text style={styles.changeText}>Change Broker</Text>
            </Pressable>
          </View>

          <Pressable onPress={onAccept} style={styles.accept}>
            <Text style={styles.acceptText}>Accept & Continue</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:{flex:1,backgroundColor:"rgba(0,0,0,.72)",justifyContent:"center",padding:18},
  card:{backgroundColor:"#111D35",borderRadius:18,padding:18,borderWidth:1,borderColor:"rgba(148,163,184,.28)"},
  title:{color:"#fff",fontSize:21,fontWeight:"900"},
  subtitle:{color:"#94A3B8",marginTop:4,marginBottom:14},
  scoreBox:{alignSelf:"center",width:110,height:110,borderRadius:55,borderWidth:8,borderColor:"#22C55E",alignItems:"center",justifyContent:"center",marginBottom:14},
  score:{color:"#fff",fontSize:28,fontWeight:"900"},
  scoreLabel:{color:"#94A3B8",fontSize:10,fontWeight:"900"},
  broker:{color:"#fff",fontSize:18,fontWeight:"900",textAlign:"center"},
  account:{color:"#38BDF8",fontWeight:"800",textAlign:"center",marginTop:4},
  status:{color:"#FBBF24",fontWeight:"800",textAlign:"center",marginTop:4},
  message:{color:"#CBD5E1",lineHeight:20,marginTop:16,textAlign:"center"},
  reason:{color:"#CBD5E1",marginTop:8},
  actions:{flexDirection:"row",gap:10,marginTop:18},
  cancel:{flex:1,borderWidth:1,borderColor:"#64748B",minHeight:44,borderRadius:9,alignItems:"center",justifyContent:"center"},
  cancelText:{color:"#CBD5E1",fontWeight:"900"},
  change:{flex:1,borderWidth:1,borderColor:"#38BDF8",minHeight:44,borderRadius:9,alignItems:"center",justifyContent:"center"},
  changeText:{color:"#38BDF8",fontWeight:"900"},
  accept:{backgroundColor:"#22C55E",minHeight:50,borderRadius:10,alignItems:"center",justifyContent:"center",marginTop:12},
  acceptText:{color:"#052E16",fontWeight:"900",fontSize:16}
});
