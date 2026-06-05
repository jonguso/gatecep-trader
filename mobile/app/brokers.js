import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useRef } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

const DOCUMENT_TYPES = [
  {
    type: "valuation",
    title: "Portfolio Valuation",
    required: true,
    description: "Required for portfolio analysis and sector allocation."
  },
  {
    type: "cash",
    title: "Cash / Ledger Statement",
    required: true,
    description: "Required to calculate available cash and trading space."
  },
  {
    type: "transactions",
    title: "Transaction / Order History",
    required: false,
    description: "Helps Coach G understand buying and selling behavior."
  },
  {
    type: "holdings",
    title: "Holdings Report",
    required: false,
    description: "Fallback report if valuation is unavailable."
  }
];

export default function BrokerUpload() {
  const [selectedType, setSelectedType] = useState("valuation");
  const [broker, setBroker] = useState("AIB");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const fileInputRef = useRef(null);

 async function pickFile() {
  if (Platform.OS === "web") {
    fileInputRef.current?.click();
    return;
  }
}

  function appendPickedFile(form, pickedFile) {
    if (pickedFile.file) {
      form.append("file", pickedFile.file, pickedFile.name);
      return;
    }

    form.append("file", {
      uri: pickedFile.uri,
      name: pickedFile.name || "upload.csv",
      type: pickedFile.mimeType || "text/csv"
    });
  }

  async function uploadFile() {
    try {
      if (!file) {
        Alert.alert("No file selected", "Please select a CSV or Excel file.");
        return;
      }

      setStatus("Uploading...");

      const form = new FormData();

      appendPickedFile(form, file);

      form.append("broker", broker);
      form.append("reportType", selectedType);

      const res = await fetch(`${API_URL}/broker-reports/upload`, {
        method: "POST",
        body: form
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text);
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      await AsyncStorage.setItem(
        "gatecepLastBrokerUpload",
        JSON.stringify({
          broker,
          reportType: selectedType,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          result: data
        })
      );

      if (selectedType === "valuation" || selectedType === "holdings") {
        await AsyncStorage.setItem(
          "gatecepPendingPortfolioImport",
          JSON.stringify({
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
            broker,
            reportType: selectedType,
            importedRows: data.data || []
          })
        );

        await AsyncStorage.setItem(
          "gatecepImportedPortfolioDraft",
          JSON.stringify((data.data || []).map(normalizeHoldingForReview))
        );

        setStatus("Valuation uploaded. Opening review screen...");
        router.push("/review-portfolio-import");
        return;
      }

      if (selectedType === "cash") {
        const availableCash = extractCash(data.data || []);

        await AsyncStorage.setItem("gatecepStatementUploaded", "true");
        await AsyncStorage.setItem("gatecepAvailableCash", String(availableCash));

        setStatus("Statement uploaded. Available cash updated.");
        router.replace("/dashboard");
        return;
      }

      if (selectedType === "transactions") {
        await AsyncStorage.setItem("gatecepTransactionsUploaded", "true");
        await AsyncStorage.setItem(
          "gatecepTransactionHistory",
          JSON.stringify(data.data || [])
        );

        setStatus("Transaction history uploaded and saved.");
        router.replace("/broker-upload");
      }
    } catch (error) {
      setStatus(error.message || "Upload failed.");
      Alert.alert("Upload Failed", error.message || "Upload failed.");
    }

if (Platform.OS === "web") {
  form.append("file", file, file.name);
} else {
  form.append("file", {
    uri: file.uri,
    name: file.name || "upload.csv",
    type: file.mimeType || "text/csv"
  });
}
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Upload Center</Text>

      <Text style={styles.subtitle}>
        Upload broker valuation, cash statement, holdings, or transaction history.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Broker</Text>

        {["AIB", "ABC", "NCBA", "Dyer & Blair"].map((b) => (
          <Pressable
            key={b}
            style={[styles.option, broker === b && styles.optionActive]}
            onPress={() => setBroker(b)}
          >
            <Text style={broker === b ? styles.optionTextActive : styles.optionText}>
              {b}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>What are you uploading?</Text>

        {DOCUMENT_TYPES.map((doc) => (
          <Pressable
            key={doc.type}
            style={[
              styles.docOption,
              selectedType === doc.type && styles.docOptionActive
            ]}
            onPress={() => setSelectedType(doc.type)}
          >
            <View>
              <Text style={styles.docTitle}>
                {doc.title} {doc.required ? "(Required)" : ""}
              </Text>
              <Text style={styles.docDesc}>{doc.description}</Text>
            </View>
          </Pressable>
        ))}
      </View>

{Platform.OS === "web" && (
  <input
    ref={fileInputRef}
    type="file"
    accept=".csv,.xls,.xlsx"
    style={{ display: "none" }}
    onChange={(event) => {
      const selected = event.target.files?.[0];

      if (selected) {
        setFile(selected);
        setStatus("");
      }
    }}
  />
)}

      <Pressable style={styles.secondary} onPress={pickFile}>
        <Text style={styles.secondaryText}>
          {file ? `Selected: ${file.name}` : "Select CSV or Excel File"}
        </Text>
      </Pressable>

      <Pressable style={styles.primary} onPress={uploadFile}>
        <Text style={styles.primaryText}>Upload Report</Text>
      </Pressable>

      <Pressable style={styles.dashboardButton} onPress={() => router.replace("/dashboard")}>
        <Text style={styles.dashboardText}>Go to Dashboard</Text>
      </Pressable>

      {status ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function normalizeHoldingForReview(row) {
  const quantity = Number(row.quantity || row.qty || 0);
  const marketPrice = Number(row.marketPrice || row.price || row.lastPrice || 0);
  const averagePrice = Number(row.averagePrice || row.avgPrice || row.costPrice || 0);
  const marketValue =
    Number(row.marketValue || row.value || 0) || quantity * marketPrice;

  return {
    symbol: String(row.symbol || row.security || row.securityCode || "").toUpperCase(),
    sector: row.sector || "Unknown",
    quantity: String(quantity),
    averagePrice: String(averagePrice),
    marketPrice: String(marketPrice),
    marketValue,
    profitLoss: Number(row.profitLoss || row.pnl || 0)
  };
}

function extractCash(rows) {
  if (!rows.length) return 0;

  const last = rows[rows.length - 1];

  const value =
    last.availableCash ||
    last.tradingSpace ||
    last.balance ||
    last.ledgerBalance ||
    0;

  return Number(String(value).replaceAll(",", "").replace(/KES/gi, "").trim()) || 0;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 80 },
  title: { color: "white", fontSize: 34, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 22 },
  card: {
    marginTop: 22,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  cardTitle: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 12
  },
  option: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    marginTop: 10
  },
  optionActive: { backgroundColor: "#9333ea" },
  optionText: { color: "#cbd5e1", fontWeight: "800" },
  optionTextActive: { color: "white", fontWeight: "900" },
  docOption: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1,
    marginTop: 12
  },
  docOptionActive: {
    borderColor: "#9333ea",
    backgroundColor: "rgba(147,51,234,.14)"
  },
  docTitle: { color: "white", fontWeight: "900" },
  docDesc: { color: "#94a3b8", marginTop: 6, lineHeight: 20 },
  primary: {
    marginTop: 18,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18
  },
  primaryText: { color: "white", fontWeight: "900", textAlign: "center" },
  secondary: {
    marginTop: 22,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 18
  },
  secondaryText: { color: "#67e8f9", fontWeight: "900", textAlign: "center" },
  dashboardButton: {
    marginTop: 14,
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderWidth: 1,
    padding: 16,
    borderRadius: 18
  },
  dashboardText: { color: "#cbd5e1", fontWeight: "900", textAlign: "center" },
  statusBox: {
    marginTop: 18,
    backgroundColor: "rgba(6,182,212,.12)",
    borderColor: "rgba(6,182,212,.35)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  statusText: { color: "#cbd5e1" }
});