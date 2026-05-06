import { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import API from "../../src/api";
import { Page, Header, Card, ActivityRow } from "../../src/components/ProTradingUI";
import GlobalAccountHeader from "../../src/components/GlobalAccountHeader";
import { P } from "../../src/theme/proTheme";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    try {
      const r = await API.get("/orders?userId=u1");
      setOrders(r.data || []);
    } catch {}
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <Page>
      <Header title="Orders" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <GlobalAccountHeader />

        <Card>
          <Text style={styles.section}>Today&apos;s Orders</Text>
          {orders.length === 0 && <Text style={styles.empty}>No orders today</Text>}
          {orders.map(o => <ActivityRow key={o.id} item={o} />)}
        </Card>
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { color: P.color.text, fontSize: 18, fontWeight: "900", marginBottom: 8 },
  empty: { color: P.color.muted, lineHeight: 20 }
});
