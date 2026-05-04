import { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, RefreshControl } from "react-native";
import API from "../../src/api";

export default function Brokers() {
  const [brokers, setBrokers] = useState([]);
  const [links, setLinks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setBrokers((await API.get("/brokers")).data);
    setLinks((await API.get("/brokers/links?userId=u1")).data);
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load().catch(() => {});
    setRefreshing(false);
  };

  const connect = async (brokerId) => {
    await API.post("/brokers/link", { userId: "u1", brokerId, brokerCustomerId: `CLIENT-${brokerId}-U1`, cdsAccount: `CDS-${brokerId}-U1` });
    await API.post("/brokers/select", { userId: "u1", brokerId });
    await load();
  };

  const linkStatus = (brokerId) => links.find(l => l.brokerId === brokerId)?.status;

  return (
    <ScrollView style={s.page} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <Text style={s.title}>Choose Your Broker</Text>
      <Text style={s.subtitle}>Connect an existing broker or select one to start onboarding.</Text>

      {brokers.map(b => (
        <View key={b.id} style={s.card}>
          <View style={s.row}>
            <Text style={s.name}>{b.name}</Text>
            <Text style={b.status === "ACTIVE_DEMO" ? s.green : s.gold}>{b.status}</Text>
          </View>
          <Text style={s.muted}>{b.notes}</Text>
          <Text style={s.muted}>API Trading: {b.supportsApiTrading ? "Yes" : "Pending partnership"}</Text>
          <Text style={s.muted}>Estimated fee: {b.fees.commissionBps / 100}% min KES {b.fees.minFee}</Text>
          <Text style={s.status}>Link Status: {linkStatus(b.id) || "NOT LINKED"}</Text>
          <Pressable style={s.button} onPress={() => connect(b.id)}>
            <Text style={s.buttonText}>{linkStatus(b.id) ? "Select Broker" : "Connect / Onboard"}</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0b0e11", padding: 14 },
  title: { color: "#f0b90b", fontSize: 26, fontWeight: "900" },
  subtitle: { color: "#9ca3af", marginBottom: 14 },
  card: { backgroundColor: "#151a21", padding: 14, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: "#263241" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  name: { color: "white", fontSize: 18, fontWeight: "900", flex: 1 },
  muted: { color: "#9ca3af", marginTop: 6 },
  status: { color: "white", marginTop: 8, fontWeight: "800" },
  green: { color: "#22c55e", fontWeight: "800" },
  gold: { color: "#f0b90b", fontWeight: "800" },
  button: { backgroundColor: "#f0b90b", padding: 13, borderRadius: 10, marginTop: 12 },
  buttonText: { color: "#111827", textAlign: "center", fontWeight: "900" }
});
