import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import ActiveUserBanner from "../src/components/ActiveUserBanner";
import { calculateExecutionReadiness }
from "../src/execution/executionReadiness";

export default function ExecutionWizard() {
  const [readiness, setReadiness] = useState(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    const result =
      await calculateExecutionReadiness();

    setReadiness(result);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>
        Execution Wizard
      </Text>

      <Text style={styles.subtitle}>
        Guided path from Coach G recommendation
        to broker execution.
      </Text>

      <ActiveUserBanner />

      <View style={styles.scoreCard}>
        <Text style={styles.score}>
          {readiness?.score || 0}%
        </Text>

        <Text style={styles.status}>
          {readiness?.status || "CHECKING"}
        </Text>
      </View>

      <Step
        title="Investor Profile"
        passed={readiness?.checks?.investorProfile}
      />

      <Step
        title="Broker Linked"
        passed={readiness?.checks?.brokerLinked}
      />

      <Step
        title="CDS Number Present"
        passed={readiness?.checks?.cdsPresent}
      />

      <Step
        title="Client Number Present"
        passed={readiness?.checks?.clientNumberPresent}
      />

      <Step
        title="Trade Basket Created"
        passed={readiness?.checks?.basketExists}
      />

      <Step
        title="Cash Available"
        passed={readiness?.checks?.cashAvailable}
      />

      <Step
        title="Portfolio Loaded"
        passed={readiness?.checks?.holdingsLoaded}
      />

      <Pressable
        style={styles.primary}
        onPress={() =>
          router.push("/execution-bridge")
        }
      >
        <Text style={styles.primaryText}>
          Continue To Execution Bridge
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Step({ title, passed }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>
        {passed ? "✓" : "○"} {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:"#020617"},
  content:{padding:22,paddingTop:70,paddingBottom:120},
  title:{color:"white",fontSize:34,fontWeight:"900"},
  subtitle:{color:"#94a3b8",marginTop:8},
  scoreCard:{
    marginTop:20,
    alignItems:"center",
    backgroundColor:"#0f172a",
    borderRadius:22,
    padding:20
  },
  score:{
    color:"#86efac",
    fontSize:52,
    fontWeight:"900"
  },
  status:{
    color:"#67e8f9",
    marginTop:8,
    fontWeight:"900"
  },
  step:{
    marginTop:12,
    backgroundColor:"#0f172a",
    padding:16,
    borderRadius:16
  },
  stepTitle:{
    color:"white",
    fontWeight:"800"
  },
  primary:{
    marginTop:24,
    backgroundColor:"#9333ea",
    padding:18,
    borderRadius:18
  },
  primaryText:{
    color:"white",
    textAlign:"center",
    fontWeight:"900"
  }
});