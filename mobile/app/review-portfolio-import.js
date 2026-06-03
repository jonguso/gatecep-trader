import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const SECTOR_MAP = {
  ABSA: "Banking",
  BAT: "Mfg. and Allied",
  COOP: "Banking",
  DTK: "Banking",
  EABL: "Mfg. and Allied",
  EQT: "Banking",
  GLD: "ETF",
  IMH: "Banking",
  KCB: "Banking",
  KEGN: "Energy and Petroleum",
  KNRE: "Insurance",
  KPC: "Energy and Petroleum",
  KPLC: "Energy and Petroleum",
  KQ: "Comm. and Services",
  SBIC: "Banking",
  SCBK: "Banking",
  SCOM: "Telecom",
  SMWF: "ETF"
};

export default function ReviewPortfolioImport() {
  const [fileInfo, setFileInfo] = useState(null);
  const [rows, setRows] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRow, setEditingRow] = useState(null);


  useEffect(() => {
    loadDraft();
  }, []);

  async function loadDraft() {
    const pendingRaw = await AsyncStorage.getItem("gatecepPendingPortfolioImport");
    const draftRaw = await AsyncStorage.getItem("gatecepImportedPortfolioDraft");

    if (pendingRaw) setFileInfo(JSON.parse(pendingRaw));

    if (draftRaw) {
      setRows(JSON.parse(draftRaw));
      return;
    }

    const starter = [
      { symbol: "SCOM", sector: "Telecom", quantity: "900", averagePrice: "29.85", marketPrice: "30.60" },
      { symbol: "KCB", sector: "Banking", quantity: "200", averagePrice: "70", marketPrice: "67.75" }
    ];

    setRows(starter);
    await AsyncStorage.setItem("gatecepImportedPortfolioDraft", JSON.stringify(starter));
  }

  function openEdit(index) {
    setEditingIndex(index);
    setEditingRow({ ...rows[index] });
  }

  async function saveEdit() {
    const copy = [...rows];
    copy[editingIndex] = editingRow;

    setRows(copy);
    await AsyncStorage.setItem("gatecepImportedPortfolioDraft", JSON.stringify(copy));

    setEditingIndex(null);
    setEditingRow(null);
  }

  async function addHolding() {
    const next = [
      ...rows,
      { symbol: "", sector: "", quantity: "", averagePrice: "", marketPrice: "" }
    ];

    setRows(next);
    await AsyncStorage.setItem("gatecepImportedPortfolioDraft", JSON.stringify(next));
    openEdit(next.length - 1);
  }

  async function removeHolding() {
    const copy = rows.filter((_, index) => index !== editingIndex);

    setRows(copy);
    await AsyncStorage.setItem("gatecepImportedPortfolioDraft", JSON.stringify(copy));

    setEditingIndex(null);
    setEditingRow(null);
  }

  async function confirmPortfolio() {
    const portfolio = rows
      .filter((row) => row.symbol && Number(row.quantity || 0) > 0)
      .map((row) => {
        const qty = Number(row.quantity || 0);
        const marketPrice = Number(row.marketPrice || 0);
        const averagePrice = Number(row.averagePrice || 0);
        const marketValue = qty * marketPrice;
        const profitLoss = marketValue - qty * averagePrice;
        const profitLossPct =
          qty * averagePrice > 0
            ? (profitLoss / (qty * averagePrice)) * 100
            : 0;

        return {
          broker: "IMPORT_REVIEW",
          symbol: String(row.symbol || "").toUpperCase().trim(),
          sector:
  row.sector && row.sector !== "Unknown"
    ? row.sector
    : SECTOR_MAP[String(row.symbol || "").toUpperCase()] || "Unknown",
quantity: qty,
          averagePrice,
          marketPrice,
          marketValue,
          value: marketValue,
          profitLoss,
          profitLossPct,
          changePct: profitLossPct
        };
      });

    if (portfolio.length === 0) {
      Alert.alert("No holdings", "Confirm at least one valid holding.");
      return;
    }

    await AsyncStorage.setItem("gatecepManualPortfolio", JSON.stringify(portfolio));

    await AsyncStorage.setItem(
      "gatecepLatestUpload",
      JSON.stringify({
        uploadedAt: new Date().toISOString(),
        valuation: {
          reportType: "confirmed-import",
          fileName: fileInfo?.fileName || "Confirmed Portfolio",
          uploadedAt: new Date().toISOString(),
          manualEntry: false,
          confirmed: true,
          parsedHoldings: portfolio
        }
      })
    );

    await AsyncStorage.removeItem("gatecepImportedPortfolioDraft");

    router.replace("/dashboard");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Review Extracted Holdings</Text>

      <Text style={styles.subtitle}>
        Tap any security to review or edit before confirming.
      </Text>

      <View style={styles.fileCard}>
        <Text style={styles.cardTitle}>Imported File</Text>
        <Text style={styles.fileName}>{fileInfo?.fileName || "Unknown File"}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 1.2 }]}>Security</Text>
          <Text style={[styles.th, { flex: 1 }]}>Sector</Text>
          <Text style={[styles.th, { flex: 0.7, textAlign: "right" }]}>Qty</Text>
          <Text style={[styles.th, { flex: 0.9, textAlign: "right" }]}>Value</Text>
          <Text style={[styles.th, { flex: 0.8, textAlign: "right" }]}>P/L</Text>
        </View>

        {rows.map((row, index) => {
          const qty = Number(row.quantity || 0);
          const marketPrice = Number(row.marketPrice || 0);
          const avg = Number(row.averagePrice || 0);
          const value = qty * marketPrice;
          const pnl = value - qty * avg;

          return (
            <Pressable key={`${row.symbol}-${index}`} style={styles.tr} onPress={() => openEdit(index)}>
              <Text style={[styles.tdStrong, { flex: 1.2 }]}>{row.symbol || "N/A"}</Text>
              <Text style={[styles.td, { flex: 1 }]}>
  {row.sector && row.sector !== "Unknown"
    ? row.sector
    : SECTOR_MAP[String(row.symbol || "").toUpperCase()] || "Unknown"}
</Text>
              <Text style={[styles.td, { flex: 0.7, textAlign: "right" }]}>{qty}</Text>
              <Text style={[styles.tdStrong, { flex: 0.9, textAlign: "right" }]}>
                {money(value)}
              </Text>
              <Text
                style={[
                  pnl >= 0 ? styles.green : styles.red,
                  { flex: 0.8, textAlign: "right" }
                ]}
              >
                {money(pnl)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.secondary} onPress={addHolding}>
        <Text style={styles.secondaryText}>Add Security</Text>
      </Pressable>

      <Pressable style={styles.primary} onPress={confirmPortfolio}>
        <Text style={styles.primaryText}>Confirm Portfolio</Text>
      </Pressable>

      <Modal visible={editingRow !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit Holding</Text>

            {editingRow ? (
              <>
                <Field label="Symbol" value={editingRow.symbol} onChange={(v) => setEditingRow({ ...editingRow, symbol: v })} />
                <Field label="Sector" value={editingRow.sector} onChange={(v) => setEditingRow({ ...editingRow, sector: v })} />
                <Field label="Quantity" value={editingRow.quantity} onChange={(v) => setEditingRow({ ...editingRow, quantity: v })} />
                <Field label="Avg Price" value={editingRow.averagePrice} onChange={(v) => setEditingRow({ ...editingRow, averagePrice: v })} />
                <Field label="Market Price" value={editingRow.marketPrice} onChange={(v) => setEditingRow({ ...editingRow, marketPrice: v })} />

                <Pressable style={styles.primary} onPress={saveEdit}>
                  <Text style={styles.primaryText}>Save Changes</Text>
                </Pressable>

                <Pressable style={styles.danger} onPress={removeHolding}>
                  <Text style={styles.dangerText}>Remove Holding</Text>
                </Pressable>

                <Pressable style={styles.secondary} onPress={() => setEditingRow(null)}>
                  <Text style={styles.secondaryText}>Cancel</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Field({ label, value, onChange }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={String(value || "")}
        onChangeText={onChange}
        placeholder={label}
        placeholderTextColor="#64748b"
      />
    </View>
  );
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 40 },
  title: { color: "white", fontSize: 32, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 21 },
  fileCard: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e293b"
  },
  cardTitle: { color: "#67e8f9", fontWeight: "900" },
  fileName: { color: "white", marginTop: 10 },
  table: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden"
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#020617",
    paddingVertical: 12,
    paddingHorizontal: 10
  },
  th: { color: "#94a3b8", fontSize: 11, fontWeight: "900" },
  tr: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    alignItems: "center"
  },
  td: { color: "#cbd5e1", fontSize: 12 },
  tdStrong: { color: "white", fontSize: 12, fontWeight: "900" },
  green: { color: "#86efac", fontSize: 12, fontWeight: "900" },
  red: { color: "#fca5a5", fontSize: 12, fontWeight: "900" },
  primary: {
    marginTop: 20,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 16
  },
  primaryText: { color: "white", fontWeight: "900", textAlign: "center" },
  secondary: {
    marginTop: 14,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16
  },
  secondaryText: { color: "#67e8f9", fontWeight: "900", textAlign: "center" },
  danger: {
    marginTop: 14,
    backgroundColor: "rgba(239,68,68,.12)",
    borderColor: "rgba(239,68,68,.35)",
    borderWidth: 1,
    padding: 15,
    borderRadius: 16
  },
  dangerText: { color: "#fca5a5", textAlign: "center", fontWeight: "900" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.75)",
    justifyContent: "center",
    padding: 18
  },
  modal: {
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    maxHeight: "90%"
  },
  modalTitle: { color: "white", fontSize: 24, fontWeight: "900" },
  label: { color: "#94a3b8", fontSize: 12 },
  input: {
    marginTop: 8,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#334155",
    padding: 14,
    borderRadius: 12,
    color: "white"
  }
});