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
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as XLSX from "xlsx";

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
          "application/csv",
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

      setStatus(`Reading ${file.name}...`);

      await AsyncStorage.setItem(
        "gatecepPendingPortfolioImport",
        JSON.stringify({
          fileName: file.name,
          uri: file.uri,
          uploadedAt: new Date().toISOString()
        })
      );

      const rows = await parsePortfolioFile(file);
      const draftRows = rows.map(normalizeHolding).filter(Boolean);

      if (!draftRows.length) {
        throw new Error(
          `No valuation rows detected. File columns found: ${Object.keys(
            rows[0] || {}
          ).join(", ")}`
        );
      }

      await AsyncStorage.setItem(
        "gatecepImportedPortfolioDraft",
        JSON.stringify(draftRows)
      );

      await AsyncStorage.setItem("gatecepStatementUploaded", "true");

      setStatus(
        `${file.name} extracted. ${draftRows.length} holdings ready for review.`
      );

      router.push("/review-portfolio-import");
    } catch (error) {
      setStatus(`Import failed: ${error.message}`);
      Alert.alert("Import failed", error.message);
    }
  }

  async function parsePortfolioFile(file) {
    const name = String(file.name || "").toLowerCase();

    if (name.endsWith(".csv")) {
      const text = await readFileText(file);

      const workbook = XLSX.read(text, {
        type: "string"
      });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      return XLSX.utils.sheet_to_json(sheet, {
        defval: ""
      });
    }

    const base64 = await readFileBase64(file);

    const workbook = XLSX.read(base64, {
      type: "base64"
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    return XLSX.utils.sheet_to_json(sheet, {
      defval: ""
    });
  }

  async function readFileText(file) {
    if (Platform.OS === "web") {
      const response = await fetch(file.uri);
      return await response.text();
    }

    return await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.UTF8
    });
  }

  async function readFileBase64(file) {
    if (Platform.OS === "web") {
      const response = await fetch(file.uri);
      const arrayBuffer = await response.arrayBuffer();

      let binary = "";
      const bytes = new Uint8Array(arrayBuffer);
      const chunkSize = 8192;

      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }

      return btoa(binary);
    }

    return await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64
    });
  }

  function normalizeHolding(row) {
    const keys = Object.keys(row);

    const findValue = (names) => {
      for (const name of names) {
        const foundKey = keys.find(
          (k) =>
            String(k).trim().toLowerCase() ===
            String(name).trim().toLowerCase()
        );

        if (foundKey) return row[foundKey];
      }

      return "";
    };

    const symbol = findValue([
      "Symbol",
      "Security",
      "Security Code",
      "Counter",
      "Share",
      "Stock",
      "Instrument"
    ]);

    const name = findValue([
      "Name",
      "Security Name",
      "Company",
      "Company Name",
      "Description"
    ]);

    const sector = findValue([
      "Sector",
      "Industry",
      "Category"
    ]);

    const quantity = cleanNumber(
      findValue([
        "Quantity",
        "Qty",
        "Shares",
        "Units",
        "Balance",
        "Holding",
        "Holdings"
      ])
    );

    const averagePrice = cleanNumber(
      findValue([
        "Average Price",
        "Avg Price",
        "Weighted Average Price",
        "WAP",
        "Cost Price",
        "Book Price",
        "Purchase Price"
      ])
    );

    const marketPrice = cleanNumber(
      findValue([
        "Market Price",
        "Current Price",
        "Price",
        "Last Price",
        "Closing Price"
      ])
    );

    const marketValue = cleanNumber(
      findValue([
        "Market Value",
        "Current Value",
        "Value",
        "Valuation",
        "Holding Value"
      ])
    );

    const profitLoss = cleanNumber(
      findValue([
        "Profit Loss",
        "Profit/Loss",
        "P/L",
        "Gain Loss",
        "Unrealized P/L",
        "Unrealized Profit Loss"
      ])
    );

    if (!symbol || !quantity) return null;

    const finalMarketPrice =
      marketPrice ||
      (marketValue > 0 && quantity > 0 ? marketValue / quantity : 0);

    const finalMarketValue =
      marketValue ||
      (quantity > 0 && finalMarketPrice > 0 ? quantity * finalMarketPrice : 0);

    return {
      symbol: String(symbol).trim().toUpperCase(),
      name: String(name || symbol).trim(),
      sector: String(sector || "Unknown").trim(),
      quantity: String(quantity),
      averagePrice: String(averagePrice || ""),
      marketPrice: String(finalMarketPrice || ""),
      marketValue: finalMarketValue,
      value: finalMarketValue,
      profitLoss: Number.isFinite(profitLoss) ? profitLoss : 0,
      source: "PORTFOLIO_VALUATION_UPLOAD"
    };
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Import Portfolio</Text>

      <Text style={styles.subtitle}>
        Upload a broker valuation CSV or Excel file. Gatecep will extract
        holdings, then let you review and edit before analysis.
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
        <View
          style={[
            styles.statusBox,
            status.toLowerCase().includes("failed") && styles.statusError
          ]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function cleanNumber(value) {
  const cleaned = String(value ?? "")
    .replaceAll(",", "")
    .replace(/KES/gi, "")
    .replace(/[^\d.-]/g, "")
    .trim();

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
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
  statusError: {
    backgroundColor: "rgba(239,68,68,.12)",
    borderColor: "rgba(239,68,68,.35)"
  },
  statusText: {
    color: "#86efac"
  }
});