import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { loadUnifiedPortfolio } from "../src/portfolio/unifiedPortfolioApi";

export default function HoldingDetails() {
  const [holdings, setHoldings] = useState([]);
  const [expandedSector, setExpandedSector] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
  useCallback(() => {
    load();
  }, [])
);

  async function load() {
    setLoading(true);
   const portfolio = await loadUnifiedPortfolio();

    setHoldings(portfolio.holdings || []);
    setLoading(false);
  }

  const totals = useMemo(() => {
    const investedValue = holdings.reduce(
      (sum, h) =>
        sum +
        Number(h.quantity || 0) *
          Number(h.averagePrice || h.averageCost || 0),
      0
    );

    const currentValue = holdings.reduce(
      (sum, h) => sum + Number(h.marketValue || h.value || 0),
      0
    );

    const netGainLoss = currentValue - investedValue;

    const gainLossPct =
      investedValue > 0 ? (netGainLoss / investedValue) * 100 : 0;

    return {
      investedValue,
      currentValue,
      netGainLoss,
      gainLossPct
    };
  }, [holdings]);

  const sectorRows = useMemo(() => {
    const grouped = {};

    holdings.forEach((h) => {
      const sector = h.sector || "Unknown";

      if (!grouped[sector]) {
        grouped[sector] = {
          sector,
          securities: [],
          totalValue: 0,
          investedValue: 0,
          profitLoss: 0
        };
      }

      const qty = Number(h.quantity || 0);
      const avg = Number(h.averagePrice || h.averageCost || 0);
      const invested = qty * avg;
      const value = Number(h.marketValue || h.value || 0);
      const pl = value - invested;

      grouped[sector].securities.push({
        ...h,
        investedValue: invested,
        profitLoss: pl
      });

      grouped[sector].totalValue += value;
      grouped[sector].investedValue += invested;
      grouped[sector].profitLoss += pl;
    });

    return Object.values(grouped).sort((a, b) => b.totalValue - a.totalValue);
  }, [holdings]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#67e8f9" />
        <Text style={styles.small}>Loading holdings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>My Holdings</Text>
          <Text style={styles.subtitle}>
            Current portfolio positions by sector.
          </Text>
        </View>

        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.replace("/(tabs)/dashboard")}
        >
          <Text style={styles.dashboardText}>Dashboard</Text>
        </Pressable>
      </View>

      <View style={styles.summary}>
        <SummaryItem
          label="Invested Value"
          value={`KES ${money(totals.investedValue)}`}
        />

        <SummaryItem
          label="Current Value"
          value={`KES ${money(totals.currentValue)}`}
          cyan
        />

        <SummaryItem
          label="Net Gain/Loss"
          value={`KES ${money(totals.netGainLoss)} (${totals.gainLossPct.toFixed(
            2
          )}%)`}
          positive={totals.netGainLoss >= 0}
        />
      </View>

      {sectorRows.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No Holdings Found</Text>
          <Text style={styles.body}>
            Upload a portfolio valuation or use Trade to buy your first security.
          </Text>

          <Pressable
            style={styles.primary}
            onPress={() => router.push("/trade")}
          >
            <Text style={styles.primaryText}>Open Trade</Text>
          </Pressable>
        </View>
      ) : (
        sectorRows.map((sector) => {
          const expanded = expandedSector === sector.sector;

          const weight =
            totals.currentValue > 0
              ? (sector.totalValue / totals.currentValue) * 100
              : 0;

          return (
            <View key={sector.sector} style={styles.card}>
              <Pressable
                onPress={() =>
                  setExpandedSector(expanded ? null : sector.sector)
                }
              >
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectorTitle}>{sector.sector}</Text>
                    <Text style={styles.small}>
                      {sector.securities.length} securities •{" "}
                      {weight.toFixed(2)}%
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.value}>
                      KES {money(sector.totalValue)}
                    </Text>

                    <Text
                      style={
                        sector.profitLoss >= 0 ? styles.green : styles.red
                      }
                    >
                      KES {money(sector.profitLoss)}
                    </Text>
                  </View>
                </View>
              </Pressable>

              {expanded &&
                sector.securities.map((sec, index) => {
                  const qty = Number(sec.quantity || 0);
                  const avg = Number(sec.averagePrice || sec.averageCost || 0);
                  const marketPrice = Number(sec.marketPrice || sec.price || 0);
                  const invested = qty * avg;
                  const value = Number(sec.marketValue || sec.value || 0);
                  const pnl = value - invested;
                  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;

                  return (
                    <View key={`${sec.symbol}-${index}`} style={styles.security}>
                      <View style={styles.row}>
                        <View>
                          <Text style={styles.symbol}>{sec.symbol}</Text>
                          <Text style={styles.small}>
                            {sec.name || sector.sector}
                          </Text>
                        </View>

                        <Text style={pnl >= 0 ? styles.green : styles.red}>
                          KES {money(pnl)}
                        </Text>
                      </View>

                      <View style={styles.grid}>
                        <Info label="Qty" value={qty.toLocaleString()} />
                        <Info label="Avg Price" value={`KES ${money(avg)}`} />
                        <Info
                          label="Market Price"
                          value={`KES ${money(marketPrice)}`}
                        />
                        <Info
                          label="Invested"
                          value={`KES ${money(invested)}`}
                        />
                        <Info label="Value" value={`KES ${money(value)}`} />
                        <Info
                          label="Return"
                          value={`${pnlPct.toFixed(2)}%`}
                          valueStyle={pnl >= 0 ? styles.green : styles.red}
                        />
                      </View>
                    </View>
                  );
                })}
            </View>
          );
        })
      )}

      <Pressable
        style={styles.backButton}
        onPress={() => router.replace("/(tabs)/dashboard")}
      >
        <Text style={styles.backText}>Back to Dashboard</Text>
      </Pressable>
    </ScrollView>
  );
}

function SummaryItem({ label, value, cyan, positive }) {
  let valueStyle = styles.white;

  if (cyan) valueStyle = styles.cyan;
  if (positive !== undefined) valueStyle = positive ? styles.green : styles.red;

  return (
    <View style={styles.summaryItem}>
      <Text style={styles.small}>{label}</Text>
      <Text style={valueStyle}>{value}</Text>
    </View>
  );
}

function Info({ label, value, valueStyle }) {
  return (
    <View style={styles.info}>
      <Text style={styles.small}>{label}</Text>
      <Text style={valueStyle || styles.white}>{value}</Text>
    </View>
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
  center: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center"
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start"
  },
  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "900"
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 8,
    lineHeight: 21
  },
  dashboardButton: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14
  },
  dashboardText: {
    color: "#67e8f9",
    fontWeight: "900"
  },
  summary: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    padding: 18,
    borderRadius: 20,
    borderColor: "#1e293b",
    borderWidth: 1,
    gap: 14
  },
  summaryItem: {
    backgroundColor: "#020617",
    padding: 14,
    borderRadius: 14,
    borderColor: "#1e293b",
    borderWidth: 1
  },
  card: {
    marginTop: 16,
    backgroundColor: "#0f172a",
    padding: 18,
    borderRadius: 20,
    borderColor: "#1e293b",
    borderWidth: 1
  },
  cardTitle: {
    color: "#67e8f9",
    fontSize: 18,
    fontWeight: "900"
  },
  body: {
    color: "#cbd5e1",
    marginTop: 10,
    lineHeight: 21
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center"
  },
  sectorTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "900"
  },
  symbol: {
    color: "white",
    fontWeight: "900",
    fontSize: 18
  },
  small: {
    color: "#94a3b8",
    marginTop: 4
  },
  value: {
    color: "white",
    fontWeight: "900",
    textAlign: "right"
  },
  cyan: {
    color: "#67e8f9",
    fontWeight: "900",
    marginTop: 6
  },
  green: {
    color: "#86efac",
    fontWeight: "900",
    marginTop: 6
  },
  red: {
    color: "#fca5a5",
    fontWeight: "900",
    marginTop: 6
  },
  white: {
    color: "white",
    fontWeight: "900",
    marginTop: 6
  },
  security: {
    marginTop: 14,
    backgroundColor: "#020617",
    padding: 14,
    borderRadius: 18,
    borderColor: "#1e293b",
    borderWidth: 1
  },
  grid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  info: {
    width: "47%",
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 12,
    borderColor: "#1e293b",
    borderWidth: 1
  },
  primary: {
    marginTop: 18,
    backgroundColor: "#9333ea",
    padding: 16,
    borderRadius: 16
  },
  primaryText: {
    color: "white",
    fontWeight: "900",
    textAlign: "center"
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 18,
    borderColor: "#334155",
    borderWidth: 1
  },
  backText: {
    color: "#67e8f9",
    textAlign: "center",
    fontWeight: "900"
  }
});