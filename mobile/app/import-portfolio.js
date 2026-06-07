import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function ImportPortfolio() {
  const [status, setStatus] = useState("");

  async function pickFile() {
    try {
      setStatus("Selecting file...");

      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: [
          "text/csv",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ]
      });

      if (result.canceled) {
        setStatus("");
        return;
      }

      const file = result.assets?.[0];

      if (!file) {
        throw new Error("No file selected.");
      }

      setStatus("Uploading and extracting holdings...");

      await AsyncStorage.setItem(
        "gatecepPendingPortfolioImport",
        JSON.stringify({
          fileName: file.name,
          uri: file.uri,
          uploadedAt: new Date().toISOString()
        })
      );

      const formData = new FormData();

      const fileType =
  file.mimeType ||
  guessMimeType(file.name);

if (file.file) {
  formData.append("file", file.file, file.name);
} else {
  formData.append("file", {
    uri: file.uri,
    name: file.name || "portfolio-upload.xlsx",
    type: fileType
  });
}

      formData.append("broker", "AIB");
      formData.append("reportType", "valuation");
      formData.append("clientNumber", "137971");
      formData.append("cdsNumber", "52470471");

      const response = await fetch(`${API_URL}/broker-reports/upload`, {
        method: "POST",
        body: formData
      });

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Upload parse failed.");
      }

      const draftRows = (json.data || []).map((row) => ({
        symbol: row.symbol || "",
        sector: row.sector || "Unknown",
        quantity: String(row.quantity || ""),
        averagePrice: String(row.averagePrice || ""),
        marketPrice: String(row.marketPrice || row.price || "")
      }));

      if (draftRows.length === 0) {
        throw new Error("No valuation rows extracted from file.");
      }

      await AsyncStorage.setItem(
        "gatecepImportedPortfolioDraft",
        JSON.stringify(draftRows)
      );

      setStatus(`${file.name} extracted. ${draftRows.length} holdings ready for review.`);

      router.push("/review-portfolio-import");
    } catch (error) {
      setStatus(`Import failed: ${error.message}`);
      Alert.alert("Import failed", error.message);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Import Portfolio</Text>

      <Text style={styles.subtitle}>
        Upload a broker valuation CSV. Gatecep will extract holdings, then let you review and edit before analysis.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recommended Columns</Text>
        <Text style={styles.body}>• Security / Symbol</Text>
        <Text style={styles.body}>• Quantity</Text>
        <Text style={styles.body}>• Weighted Average Price</Text>
        <Text style={styles.body}>• Market Price</Text>
        <Text style={styles.body}>• Market Value</Text>
        <Text style={styles.body}>• Profit / Loss</Text>
      </View>

      <Pressable style={styles.primary} onPress={pickFile}>
        <Text style={styles.primaryText}>Upload CSV / Excel and Review</Text>
      </Pressable>

      <Pressable
        style={styles.secondary}
        onPress={() => router.push("/manual-portfolio-entry")}
      >
        <Text style={styles.secondaryText}>Enter Holdings Manually</Text>
      </Pressable>

      {status ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function guessMimeType(name = "") {
  const lower = String(name).toLowerCase();

  if (lower.endsWith(".csv")) {
    return "text/csv";
  }

  if (lower.endsWith(".xls")) {
    return "application/vnd.ms-excel";
  }

  if (lower.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  return "application/octet-stream";
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 40 },
  title: { color: "white", fontSize: 34, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 22 },
  card: {
    marginTop: 24,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  cardTitle: {
    color: "#67e8f9",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10
  },
  body: {
    color: "#cbd5e1",
    marginTop: 8,
    lineHeight: 20
  },
  primary: {
    marginTop: 24,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18
  },
  primaryText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900"
  },
  secondary: {
    marginTop: 14,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 18
  },
  secondaryText: {
    color: "#67e8f9",
    textAlign: "center",
    fontWeight: "900"
  },
  statusBox: {
    marginTop: 18,
    backgroundColor: "rgba(34,197,94,.12)",
    borderColor: "rgba(34,197,94,.35)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  statusText: {
    color: "#86efac"
  }
});