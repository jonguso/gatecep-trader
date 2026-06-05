import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const amounts = [5000, 10000, 25000, 50000, 100000];

export default function Coach() {
  const [portfolio, setPortfolio] = useState([]);
  const [dashboardContext, setDashboardContext] = useState(null);
  const [amount, setAmount] = useState(10000);
  const [sectorPlan, setSectorPlan] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const portfolioRaw = await AsyncStorage.getItem("gatecepManualPortfolio");
    const contextRaw = await AsyncStorage.getItem("gatecepCoachContext");

    if (portfolioRaw) {
      setPortfolio(JSON.parse(portfolioRaw));
    }

    if (contextRaw) {
      setDashboardContext(JSON.parse(contextRaw));
    }
  }

  const value = useMemo(() => {
    return portfolio.reduce(
      (sum, x) => sum + Number(x.marketValue || x.value || 0),
      0
    );
  }, [portfolio]);

  const largestSector = dashboardContext?.largestSector || "N/A";

  function recommendation() {
    if (largestSector === "Banking") {
      return [
        { sector: "Mfg. and Allied", weight: 30 },
        { sector: "Telecom", weight: 25 },
        { sector: "Energy and Petroleum", weight: 15 },
        { sector: "ETF", weight: 15 },
        { sector: "Comm. and Services", weight: 5 },
        { sector: "Cash Reserve", weight: 10, reserve: true }
      ];
    }

    return [
      { sector: "ETF", weight: 30 },
      { sector: "Telecom", weight: 25 },
      { sector: "Mfg. and Allied", weight: 20 },
      { sector: "Insurance", weight: 10 },
      { sector: "Cash Reserve", weight: 15, reserve: true }
    ];
  }

  function simulate() {
    const plan = recommendation().map((x) => ({
      ...x,
      amount: (amount * x.weight) / 100
    }));

    setSectorPlan(plan);
  }

  async function saveRecommendation() {
    const raw = await AsyncStorage.getItem("gatecepRecommendationHistory");
    const history = raw ? JSON.parse(raw) : [];

    history.unshift({
      savedAt: new Date().toISOString(),
      portfolioValue: value,
      largestSector,
      amount,
      sectorPlan,
      status: "SAVED_NOT_EXECUTED"
    });

    await AsyncStorage.setItem(
      "gatecepRecommendationHistory",
      JSON.stringify(history)
    );

    Alert.alert("Saved", "Coach G strategy saved to your profile.");
  }

  function buildSectorDetails(sector) {
    const allocation = Number(sector.amount || 0);

    const stocksBySector = {
      "Mfg. and Allied": [
        ["EABL", 248, "Breweries and manufacturing exposure", "East African Breweries", 5.2],
        ["BAT", 520, "Consumer defensive manufacturer", "BAT Kenya", 7.8],
        ["BAMB", 37, "Cement and building materials exposure", "Bamburi Cement", 3.5]
      ],
      Telecom: [
        ["SCOM", 30.6, "Telecom and mobile money exposure", "Safaricom", 4.7]
      ],
      "Energy and Petroleum": [
        ["KPLC", 16.1, "Power utility exposure", "Kenya Power", 2.8],
        ["KPC", 22.75, "Petroleum infrastructure exposure", "Kenya Pipeline", 3.1],
        ["KEGN", 45.5, "Electricity generation exposure", "KenGen", 4.2]
      ],
      ETF: [
        ["GLD", 5690, "Gold ETF diversification", "Gold ETF", 4.0],
        ["SMWF", 950, "Broad market ETF diversification", "Satrix MSCI World Feeder", 3.5]
      ],
      Insurance: [
        ["KNRE", 34.3, "Insurance sector exposure", "Kenya Re", 4.6],
        ["JUB", 190, "Insurance and financial services exposure", "Jubilee Holdings", 3.8]
      ],
      "Comm. and Services": [
        ["KQ", 3.8, "Transport and services exposure", "Kenya Airways", 0],
        ["NMG", 18.5, "Media and communication services exposure", "Nation Media Group", 2.2]
      ]
    };

    const stocks = stocksBySector[sector.sector] || [];
    const actionable = stocks.filter(([, price]) => allocation >= price);

    const holdings = actionable.map(([symbol, price, reason, name, dividendYield = 0]) => ({
      symbol,
      name,
      price,
      reason,
      dividendYield,
      qty: 0,
      invested: 0
    }));

    if (!holdings.length) {
      return {
        holdings: [],
        unused: allocation,
        investedTotal: 0,
        expectedDividend: 0
      };
    }

    const perStock = allocation / holdings.length;
    let investedTotal = 0;

    holdings.forEach((h) => {
      const qty = Math.floor(perStock / h.price);
      const invested = qty * h.price;

      h.qty += qty;
      h.invested += invested;
      investedTotal += invested;
    });

    let remaining = allocation - investedTotal;

    while (true) {
      const affordable = holdings
        .filter((h) => h.price <= remaining)
        .sort((a, b) => a.price - b.price);

      if (!affordable.length) break;

      const buy = affordable[0];
      buy.qty += 1;
      buy.invested += buy.price;
      investedTotal += buy.price;
      remaining -= buy.price;
    }

    const finalHoldings = holdings.filter((h) => h.qty > 0 && h.invested > 0);

    const expectedDividend = finalHoldings.reduce(
      (sum, h) => sum + h.invested * (Number(h.dividendYield || 0) / 100),
      0
    );

    return {
      holdings: finalHoldings,
      unused: remaining,
      investedTotal,
      expectedDividend
    };
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Coach G</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Portfolio Value</Text>
        <Text style={styles.metric}>KES {money(value)}</Text>

        <Text style={styles.label}>Largest Exposure</Text>
        <Text style={styles.metric2}>{largestSector}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Coach G Analysis Context</Text>

        <Text style={styles.body}>Largest Sector: {largestSector}</Text>
        <Text style={styles.body}>Risk: {dashboardContext?.risk || "N/A"}</Text>
        <Text style={styles.body}>
          Cash: KES {money(dashboardContext?.cash || 0)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Scenario Amount</Text>

        <View style={styles.amountRow}>
          {amounts.map((a) => (
            <Pressable
              key={a}
              style={[styles.chip, amount === a && styles.chipActive]}
              onPress={() => setAmount(a)}
            >
              <Text style={amount === a ? styles.white : styles.gray}>
                KES {money(a)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Coach G Sector Plan</Text>

        <Text style={styles.body}>
          Coach G will avoid adding more {largestSector} exposure and redirect
          new money toward underweight sectors using the same sector language as
          your dashboard.
        </Text>
      </View>

      <Pressable style={styles.primary} onPress={simulate}>
        <Text style={styles.primaryText}>Run Simulation</Text>
      </Pressable>

      {sectorPlan.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.section}>Recommended Sectors</Text>

          {sectorPlan.map((sector) => (
            <Pressable
              key={sector.sector}
              style={[styles.planRow, sector.reserve && styles.reserveRow]}
              onPress={() => {
                if (!sector.reserve) {
                  setSelectedSector(sector);
                }
              }}
            >
              <View style={styles.planLeft}>
                <Text style={styles.planTitle}>{sector.sector}</Text>
                <Text style={styles.body}>
                  {sector.weight}% • KES {money(sector.amount)}
                </Text>
              </View>

              <Text style={sector.reserve ? styles.reserveLink : styles.link}>
                {sector.reserve ? "Held as Cash" : "Sector Details"}
              </Text>
            </Pressable>
          ))}

          <Pressable style={styles.secondary} onPress={saveRecommendation}>
            <Text style={styles.primaryText}>Save Strategy To Profile</Text>
          </Pressable>
        </View>
      )}

      <SectorDetailsModal
        sector={selectedSector}
        onClose={() => setSelectedSector(null)}
        buildSectorDetails={buildSectorDetails}
      />
    </ScrollView>
  );
}

function SectorDetailsModal({ sector, onClose, buildSectorDetails }) {
  if (!sector) return null;

  const details = buildSectorDetails(sector);

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <View style={styles.popupHeader}>
            <View>
              <Text style={styles.popupTitle}>{sector.sector}</Text>
              <Text style={styles.body}>Allocation: KES {money(sector.amount)}</Text>
              <Text style={styles.section}>
                Holdings ({details.holdings.length} securities)
              </Text>
            </View>

            <Pressable onPress={onClose}>
              <Text style={styles.gray}>Close</Text>
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 340 }}>
            {details.holdings.map((h) => (
              <View key={h.symbol} style={styles.stockRow}>
                <View style={styles.stockLeft}>
                  <Text style={styles.stockSymbol}>{h.symbol}</Text>
                  <Text style={styles.stockName}>{h.name}</Text>
                  <Text style={styles.stockReason}>{h.reason}</Text>
                </View>

                <View style={styles.stockRight}>
                  <Text style={styles.stockShares}>{h.qty} shares</Text>
                  <Text style={styles.marketPrice}>@ KES {money(h.price)}</Text>
                  <Text style={styles.stockValue}>KES {money(h.invested)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.summaryStrip}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Invested</Text>
              <Text style={styles.summaryValue}>KES {money(details.investedTotal)}</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Unused</Text>
              <Text style={styles.summaryValueYellow}>KES {money(details.unused)}</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Allocation</Text>
              <Text style={styles.summaryValue}>KES {money(sector.amount)}</Text>
            </View>
          </View>

          <View style={styles.dividendBox}>
            <Text style={styles.summaryLabel}>Estimated Annual Dividend</Text>
            <Text style={styles.dividendValue}>
              KES {money(details.expectedDividend)}
            </Text>
          </View>

          {details.unused > 0 && (
            <View style={styles.unused}>
              <Text style={styles.white}>Unused Cash</Text>
              <Text style={styles.metric2}>KES {money(details.unused)}</Text>
              <Text style={styles.body}>
                This amount cannot buy a full additional share and should remain
                in cash.
              </Text>
            </View>
          )}

          <View style={styles.reasonBox}>
            <Text style={styles.body}>
              Coach G selected these securities because they fit the recommended
              sector and can be purchased with the available allocation.
            </Text>
          </View>

          <View style={styles.compare}>
            <Text style={styles.section}>Before vs After</Text>
            <Text style={styles.body}>Largest Sector: 35%</Text>
            <Text style={styles.body}>Projected: 26%</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function money(v) {
  return Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
  title: { fontSize: 34, fontWeight: "900", color: "white" },
  card: {
    marginTop: 18,
    padding: 18,
    backgroundColor: "#0f172a",
    borderRadius: 20
  },
  label: { color: "#94a3b8" },
  metric: { fontSize: 30, fontWeight: "900", color: "#67e8f9" },
  metric2: { fontSize: 24, fontWeight: "900", color: "white" },
  section: { color: "#67e8f9", fontWeight: "900", marginTop: 8 },
  body: { marginTop: 8, color: "#cbd5e1", lineHeight: 20 },
  amountRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  chip: { padding: 12, borderRadius: 999, backgroundColor: "#1e293b" },
  chipActive: { backgroundColor: "#9333ea" },
  white: { color: "white" },
  gray: { color: "#94a3b8" },
  primary: {
    marginTop: 20,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 16
  },
  secondary: {
    marginTop: 14,
    backgroundColor: "#1e293b",
    padding: 18,
    borderRadius: 16
  },
  primaryText: { color: "white", fontWeight: "900", textAlign: "center" },
  planRow: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  reserveRow: {
    backgroundColor: "rgba(251,191,36,.08)",
    borderColor: "rgba(251,191,36,.35)",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginTop: 12
  },
  planLeft: { flex: 1, paddingRight: 12 },
  planTitle: { color: "white", fontWeight: "900" },
  link: { color: "#67e8f9", fontWeight: "900" },
  reserveLink: { color: "#fbbf24", fontWeight: "900" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.65)",
    justifyContent: "center",
    padding: 16
  },
  popup: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: "#020617",
    padding: 20,
    borderRadius: 24,
    borderColor: "#0891b2",
    borderWidth: 1
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  popupTitle: { fontSize: 26, fontWeight: "900", color: "#67e8f9" },
  stockRow: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#111827",
    borderRadius: 14,
    borderColor: "#1f2937",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  stockLeft: { flex: 1 },
  stockSymbol: { color: "white", fontSize: 16, fontWeight: "900" },
  stockName: { color: "#94a3b8", marginTop: 4 },
  stockReason: { color: "#93c5fd", marginTop: 4, fontSize: 12 },
  stockRight: { alignItems: "flex-end", minWidth: 95 },
  stockShares: { color: "#67e8f9", fontWeight: "900" },
  marketPrice: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  stockValue: { color: "#cbd5e1", marginTop: 4 },
  summaryStrip: {
    marginTop: 18,
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryLabel: { color: "#94a3b8", fontSize: 11 },
  summaryValue: { color: "#67e8f9", fontWeight: "900", marginTop: 5 },
  summaryValueYellow: { color: "#fde047", fontWeight: "900", marginTop: 5 },
  dividendBox: {
    marginTop: 14,
    backgroundColor: "rgba(16,185,129,.10)",
    borderColor: "rgba(16,185,129,.45)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16
  },
  dividendValue: {
    color: "#86efac",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 6
  },
  unused: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#1c1917",
    borderColor: "#854d0e",
    borderWidth: 1
  },
  reasonBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#082f49",
    borderColor: "#075985",
    borderWidth: 1
  },
  compare: { marginTop: 20 }
});