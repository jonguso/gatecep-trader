import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";

export default function BrokerUpload() {
  const [profile, setProfile] = useState(null);
  const [broker, setBroker] = useState(null);
  const [status, setStatus] = useState("");
  const [selectedBroker, setSelectedBroker] = useState("AIB-AXYS");
  const [clientNumber, setClientNumber] = useState("137971");
  const [cdsNumber, setCdsNumber] = useState("52470471");

  const [upload, setUpload] = useState({
    uploadedAt: null,
    valuation: null,
    cash: null,
    transactions: null,
    holdings: null
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const profileRaw = await AsyncStorage.getItem("gatecepInvestorProfile");
    const brokerRaw = await AsyncStorage.getItem("gatecepBrokerProfile");
    const uploadRaw = await AsyncStorage.getItem("gatecepLatestUpload");

    setProfile(profileRaw ? JSON.parse(profileRaw) : null);
    setBroker(brokerRaw ? JSON.parse(brokerRaw) : null);

    const brokerLinkRaw = await AsyncStorage.getItem("gatecepBrokerLink");
    const brokerLink = brokerLinkRaw ? JSON.parse(brokerLinkRaw) : null;

if (brokerLink) {
  setSelectedBroker(brokerLink.broker || "AIB-AXYS");
  setClientNumber(brokerLink.clientNumber || "");
  setCdsNumber(brokerLink.cdsNumber || "");
}

    if (uploadRaw) {
      setUpload(JSON.parse(uploadRaw));
      setStatus("Previous upload record loaded.");
    }
  }

  function isNewInvestor() {
    return profile?.profile?.customerPath === "NEW_INVESTOR";
  }

  async function saveUploadRecord(nextUpload) {
    await AsyncStorage.setItem(
      "gatecepLatestUpload",
      JSON.stringify(nextUpload)
    );

 await AsyncStorage.setItem(
  "gatecepBrokerLink",
  JSON.stringify({
    broker: selectedBroker,
    clientNumber,
    cdsNumber,
    updatedAt: new Date().toISOString()
  })
);

await AsyncStorage.setItem(
  "gatecepBrokerProfile",
  JSON.stringify({
    broker: selectedBroker,
    clientNumber,
    cdsNumber,
    updatedAt: new Date().toISOString()
  })
);

    const verify = await AsyncStorage.getItem("gatecepLatestUpload");

    if (!verify) {
      throw new Error("Upload save verification failed.");
    }
  }

  async function pick(type) {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: [
          "application/pdf",
          "text/csv",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ]
      });

      if (result.canceled) return;

      const file = result.assets?.[0];

      const formData = new FormData();

formData.append("file", {
  uri: file.uri,
  name: file.name,
  type:
    file.mimeType ||
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
});

formData.append("broker", selectedBroker || "AIB");
formData.append("reportType", type);
formData.append("clientNumber", clientNumber || "");
formData.append("cdsNumber", cdsNumber || "");

const response = await fetch(
  `${process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000"}/broker-reports/upload`,
  {
    method: "POST",
    body: formData
  }
);

const uploaded = await response.json();

if (!response.ok || !uploaded.ok) {
  throw new Error(uploaded.error || "Backend upload failed.");
}

      const nextUpload = {
        ...upload,
        uploadedAt: new Date().toISOString(),
        [type]: {
  reportType: type,
  fileName: file.name,
  fileSize: file.size || 0,
  uri: file.uri,
  uploadedAt: new Date().toISOString(),
  backendStored: true,
  imported: uploaded.imported,
  storedCount: uploaded.storedCount,
  broker: uploaded.broker,
  clientNumber: uploaded.clientNumber,
  cdsNumber: uploaded.cdsNumber
}
      };

      setUpload(nextUpload);
      await saveUploadRecord(nextUpload);

      setStatus(`${labelFor(type)} saved successfully.`);
    } catch (error) {
      setStatus(`Upload save failed: ${error.message}`);
      Alert.alert("Upload failed", error.message);
    }
  }

  function continueAnalysis() {
    if (!isNewInvestor() && !upload.valuation) {
      Alert.alert(
        "Valuation Required",
        "Existing investors need a valuation report because it represents the current position of security holdings."
      );
      return;
    }

    router.push("/dashboard");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Portfolio Upload Center</Text>

      <Text style={styles.subtitle}>
        Coach G uses valuation, cash statement, and transaction history to
        understand current holdings, available cash, and investor behavior.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Investor Mode</Text>
        <Text style={styles.mode}>
          {isNewInvestor() ? "New Investor" : "Existing Investor"}
        </Text>
        <Text style={styles.body}>
          {isNewInvestor()
            ? "Upload is optional until you begin investing."
            : "Valuation report is required for current portfolio analysis."}
        </Text>
        <Text style={styles.body}>
          Broker: {broker?.broker || "Not selected"}
        </Text>

         <Text style={styles.inputLabel}>Broker</Text>
<TextInput
  value={selectedBroker}
  onChangeText={setSelectedBroker}
  style={styles.input}
  placeholder="AIB-AXYS"
  placeholderTextColor="#64748b"
/>

<Text style={styles.inputLabel}>Client Number</Text>
<TextInput
  value={clientNumber}
  onChangeText={setClientNumber}
  style={styles.input}
  placeholder="Client Number"
  placeholderTextColor="#64748b"
/>

<Text style={styles.inputLabel}>CDS Number</Text>
<TextInput
  value={cdsNumber}
  onChangeText={setCdsNumber}
  style={styles.input}
  placeholder="CDS Number"
  placeholderTextColor="#64748b"
/>
       
      </View>

      <UploadCard
        title="Valuation Report"
        badge={!isNewInvestor() ? "Required" : "Optional"}
        description="Primary source of portfolio truth: current securities, market value, average cost, and P/L."
        file={upload.valuation}
        onPress={() => pick("valuation")}
      />

      <UploadCard
        title="Cash Statement / Ledger"
        badge="Recommended"
        description="Used to calculate available cash, ledger balance, deposits, and withdrawals."
        file={upload.cash}
        onPress={() => pick("cash")}
      />

      <UploadCard
        title="Transaction / Order History"
        badge="Optional"
        description="Shows user behavior, trading frequency, discipline, and goal alignment."
        file={upload.transactions}
        onPress={() => pick("transactions")}
      />

      <UploadCard
        title="Holdings Report"
        badge="Fallback"
        description="Free/settled portfolio only. May miss unsettled purchases or sales."
        file={upload.holdings}
        onPress={() => pick("holdings")}
      />

      {status ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : null}

      <Pressable style={styles.primary} onPress={continueAnalysis}>
        <Text style={styles.primaryText}>Continue to Portfolio Analysis</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={() => router.push("/dashboard")}>
        <Text style={styles.secondaryText}>Back to Checklist</Text>
      </Pressable>
    </ScrollView>
  );
}

function UploadCard({ title, badge, description, file, onPress }) {
  return (
    <View style={styles.uploadCard}>
      <View style={styles.uploadHeader}>
        <Text style={styles.uploadTitle}>{title}</Text>
        <Text style={styles.badge}>{badge}</Text>
      </View>

      <Text style={styles.uploadDesc}>{description}</Text>

      <Text style={file ? styles.fileSaved : styles.fileMissing}>
        {file?.fileName || "No file uploaded"}
      </Text>

      <Pressable style={styles.uploadButton} onPress={onPress}>
        <Text style={styles.uploadButtonText}>
          {file ? "Replace File" : "Upload File"}
        </Text>
      </Pressable>
    </View>
  );
}

function labelFor(type) {
  if (type === "valuation") return "Valuation report";
  if (type === "cash") return "Cash statement";
  if (type === "transactions") return "Transaction history";
  if (type === "holdings") return "Holdings report";
  return "File";
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 40 },
  title: { color: "white", fontSize: 32, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 22 },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 18,
    marginTop: 24
  },
  cardTitle: { color: "#67e8f9", fontWeight: "900" },
  mode: { color: "white", fontSize: 22, fontWeight: "900", marginTop: 8 },
  body: { color: "#cbd5e1", marginTop: 8, lineHeight: 20 },
  uploadCard: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#1e293b"
  },
  uploadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  uploadTitle: { color: "white", fontWeight: "900", flex: 1 },
  badge: { color: "#fde68a", fontWeight: "900", fontSize: 12 },
  uploadDesc: { color: "#94a3b8", marginTop: 8, lineHeight: 20 },
  fileSaved: { color: "#86efac", marginTop: 12, fontWeight: "900" },
  fileMissing: { color: "#fca5a5", marginTop: 12 },
  uploadButton: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 14,
    marginTop: 14
  },
  uploadButtonText: {
    color: "#67e8f9",
    fontWeight: "900",
    textAlign: "center"
  },

 inputLabel: {
  color: "#94a3b8",
  fontSize: 12,
  marginTop: 14
},
input: {
  backgroundColor: "#020617",
  borderColor: "#334155",
  borderWidth: 1,
  borderRadius: 14,
  padding: 13,
  color: "white",
  marginTop: 8
}, 

  statusBox: {
    backgroundColor: "rgba(34,197,94,.12)",
    borderColor: "rgba(34,197,94,.35)",
    borderWidth: 1,
    padding: 14,
    borderRadius: 16,
    marginTop: 18
  },
  statusText: { color: "#e2e8f0" },
  primary: {
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18,
    marginTop: 26
  },
  primaryText: { color: "white", textAlign: "center", fontWeight: "900" },
  secondary: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 18,
    marginTop: 14
  },
  secondaryText: {
    color: "#67e8f9",
    fontWeight: "900",
    textAlign: "center"
  }
});