import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, View, Text, TextInput, StyleSheet } from "react-native";
import { Page } from "../../src/components/ProTradingUI";
import BrokerHeader from "../../src/components/BrokerHeader";
import { getBrokerOrders, cancelBrokerOrder } from "../../src/services/brokerMirrorApi";

export default function Orders() {
  const [payload, setPayload] = useState(null);
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");

  const load = async () => {
    const data = await getBrokerOrders("u1");
    setPayload(data);
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const orders = useMemo(() => {
    let rows = payload?.orders || [];
    if (tab === "Pending") rows = rows.filter(o => ["PENDING", "PENDING_BROKER_CONFIRMATION", "OPEN"].includes(String(o.status).toUpperCase()));
    if (q) rows = rows.filter(o => String(o.symbol || "").toLowerCase().includes(q.toLowerCase()) || String(o.brokerName || "").toLowerCase().includes(q.toLowerCase()));
    return rows;
  }, [payload, tab, q]);

  const cancel = async (o) => {
    try {
      await cancelBrokerOrder({ userId:"u1", brokerId:o.brokerId, orderId:o.id || o.brokerOrderId });
      await load();
    } catch {
      Alert.alert("Cancel Failed", "Could not cancel broker order.");
    }
  };

  return (
    <Page>
      <BrokerHeader title="Orders" subtitle="Broker mirrored order book" />
      <ScrollView style={styles.body}>
        <View style={styles.tabs}>
          {["All","Pending"].map(x => (
            <Pressable key={x} onPress={() => setTab(x)} style={[styles.tab, tab === x && styles.active]}>
              <Text style={[styles.tabText, tab === x && styles.activeText]}>{x}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput value={q} onChangeText={setQ} placeholder="Search symbol or broker" placeholderTextColor="#94A3B8" style={styles.search} />

        {orders.map(o => (
          <View key={`${o.brokerId}-${o.id}`} style={styles.card}>
            <View style={styles.top}>
              <Text style={styles.symbol}>{o.side} {o.symbol}</Text>
              <Text style={styles.status}>{o.status}</Text>
            </View>
            <Text style={styles.broker}>{o.brokerName}</Text>
            <Text style={styles.detail}>Qty {o.qty} @ {o.price}</Text>
            <Text style={styles.detail}>{new Date(o.submittedAt).toLocaleString()}</Text>
            {["PENDING","PENDING_BROKER_CONFIRMATION","OPEN"].includes(String(o.status).toUpperCase()) && (
              <Pressable onPress={() => cancel(o)} style={styles.cancel}>
                <Text style={styles.cancelText}>Cancel Order</Text>
              </Pressable>
            )}
          </View>
        ))}

        {orders.length === 0 && <Text style={styles.empty}>No broker orders found.</Text>}
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  body:{backgroundColor:"#08111F",padding:16},
  tabs:{flexDirection:"row",gap:10,marginBottom:12},
  tab:{flex:1,borderWidth:1,borderColor:"#334155",borderRadius:10,paddingVertical:10,alignItems:"center"},
  active:{backgroundColor:"#0B5CFF",borderColor:"#0B5CFF"},
  tabText:{color:"#CBD5E1",fontWeight:"900"},
  activeText:{color:"#fff"},
  search:{backgroundColor:"#111D35",borderWidth:1,borderColor:"rgba(148,163,184,.22)",borderRadius:12,minHeight:50,paddingHorizontal:14,color:"#fff",marginBottom:14},
  card:{backgroundColor:"#111D35",borderRadius:14,padding:14,marginBottom:12,borderWidth:1,borderColor:"rgba(148,163,184,.22)"},
  top:{flexDirection:"row",justifyContent:"space-between"},
  symbol:{color:"#fff",fontSize:18,fontWeight:"900"},
  status:{color:"#FBBF24",fontWeight:"900"},
  broker:{color:"#38BDF8",marginTop:5,fontWeight:"900"},
  detail:{color:"#CBD5E1",marginTop:5},
  cancel:{borderWidth:1,borderColor:"#EF4444",borderRadius:8,minHeight:40,alignItems:"center",justifyContent:"center",marginTop:12},
  cancelText:{color:"#EF4444",fontWeight:"900"},
  empty:{color:"#94A3B8",textAlign:"center",marginTop:30}
});
