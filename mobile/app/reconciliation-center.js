import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import ActiveUserBanner from "../src/components/ActiveUserBanner";
import { runPositionReconciliation } from "../src/reconciliation/positionReconciliation";

export default function ReconciliationCenter() {
  const [result, setResult] = useState(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    const reconciliation = await runPositionReconciliation();
    setResult(reconciliation);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Portfolio Health Center</Text>

        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.replace("/(tabs)/dashboard")}
        >
          <Text style={styles.dashboardButtonText}>Dashboard</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Verify broker holdings against GateCEP portfolio records.
      </Text>

      <ActiveUserBanner />

      <View style={styles.summary}>
        <Text style={styles.score}>
          {result?.healthScore || 0}%
        </Text>

        <Text style={styles.status}>
          {result?.status || "CHECKING"}
        </Text>

        <Text style={styles.body}>
          Holdings Match Verification
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Summary</Text>

        <Info
          label="Total Symbols"
          value={result?.totalSymbols}
        />

        <Info
          label="Matched"
          value={result?.matchedSymbols}
        />

        <Info
          label="Mismatches"
          value={result?.mismatchCount}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Position Mismatches</Text>

        {!result?.mismatches?.length ? (
          <Text style={styles.good}>
            ✓ All broker positions reconcile successfully.
          </Text>
        ) : (
          result.mismatches.map((item) => (
            <View key={item.symbol} style={styles.row}>
              <Text style={styles.symbol}>
                {item.symbol}
              </Text>

              <Text style={styles.body}>
                GateCEP: {item.localQuantity}
              </Text>

              <Text style={styles.body}>
                Broker: {item.brokerQuantity}
              </Text>

              <Text style={styles.warning}>
                Difference: {item.difference}
              </Text>
            </View>
          ))
        )}
      </View>

      <Pressable style={styles.primary} onPress={load}>
        <Text style={styles.primaryText}>
          Run Reconciliation
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? 0}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:"#020617"},
  content:{padding:22,paddingTop:70,paddingBottom:120},
  headerRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  title:{color:"white",fontSize:30,fontWeight:"900",flex:1},
  subtitle:{color:"#94a3b8",marginTop:10},
  dashboardButton:{backgroundColor:"#1e293b",padding:10,borderRadius:12},
  dashboardButtonText:{color:"#67e8f9",fontWeight:"900"},
  summary:{marginTop:20,alignItems:"center"},
  score:{fontSize:54,color:"#86efac",fontWeight:"900"},
  status:{color:"#67e8f9",fontWeight:"900",marginTop:6},
  card:{marginTop:20,backgroundColor:"#0f172a",padding:18,borderRadius:20},
  cardTitle:{color:"#67e8f9",fontWeight:"900",fontSize:18,marginBottom:12},
  infoRow:{paddingVertical:10},
  infoLabel:{color:"#94a3b8"},
  infoValue:{color:"white",fontWeight:"900"},
  row:{paddingVertical:12,borderBottomWidth:1,borderBottomColor:"#1e293b"},
  symbol:{color:"white",fontWeight:"900"},
  body:{color:"#cbd5e1",marginTop:4},
  warning:{color:"#fca5a5",marginTop:4,fontWeight:"900"},
  good:{color:"#86efac",fontWeight:"900"},
  primary:{marginTop:20,backgroundColor:"#9333ea",padding:18,borderRadius:18},
  primaryText:{color:"white",textAlign:"center",fontWeight:"900"}
});