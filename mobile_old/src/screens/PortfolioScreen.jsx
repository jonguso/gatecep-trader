import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet
} from "react-native";

import { API_URL } from "../config/api";

export default function PortfolioScreen() {
  const [portfolio, setPortfolio] = useState(null);
  const [pnl, setPnl] = useState(null);
  const [settlement, setSettlement] = useState(null);
  const [brokers, setBrokers] = useState([]);

  async function loadData() {
    try {
      const [portfolioRes, pnlRes, settlementRes, brokersRes] =
        await Promise.all([
          fetch(`${API_URL}/portfolio-live`),
          fetch(`${API_URL}/pnl`),
          fetch(`${API_URL}/settlement-ledger`),
          fetch(`${API_URL}/broker-accounts`)
        ]);

      const portfolioData = await portfolioRes.json();
      const pnlData = await pnlRes.json();
      const settlementData = await settlementRes.json();
      const brokersData = await brokersRes.json();

      if (portfolioData.ok) setPortfolio(portfolioData.portfolio);
      if (pnlData.ok) setPnl(pnlData.pnl);
      if (settlementData.ok) setSettlement(settlementData.settlement);
      if (brokersData.ok) setBrokers(brokersData.accounts || []);
    } catch (error) {
      console.log("Portfolio load failed", error.message);
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 7000);

    return () => clearInterval(interval);
  }, []);
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Portfolio + P&L</Text>

      {portfolio && (
        <View style={styles.card}>
          <Text style={styles.label}>Total Market Value</Text>
          <Text style={styles.bigValue}>KES {portfolio.totalMarketValue}</Text>

          <Text style={styles.green}>
            Unrealized P&L: KES {portfolio.totalUnrealizedPnL}
          </Text>

          <Text style={styles.meta}>
            Buying Power: KES {portfolio.availableBuyingPower}
          </Text>
        </View>
      )}

{pnl && (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>Realized P&L</Text>

    <Text style={pnl.totalRealizedPnL >= 0 ? styles.green : styles.red}>
      KES {pnl.totalRealizedPnL}
    </Text>

    <Text style={styles.meta}>
      Trades: {pnl.totalTrades} | Wins: {pnl.winningTrades} | Losses: {pnl.losingTrades}
    </Text>
  </View>
)}
      {portfolio?.positions?.map((pos) => (
        <View key={pos.symbol} style={styles.rowCard}>
          <View>
            <Text style={styles.symbol}>{pos.symbol}</Text>
            <Text style={styles.meta}>Qty: {pos.quantity}</Text>
            <Text style={styles.meta}>
              Avg Cost: KES {pos.averageCost}
            </Text>
          </View>

          <View>
            <Text style={styles.value}>
              KES {pos.marketValue}
            </Text>

            <Text
              style={
                pos.unrealizedPnL >= 0
                  ? styles.green
                  : styles.red
              }
            >
              {pos.unrealizedPnLPercent}%
            </Text>
          </View>
        </View>
      ))}

      {settlement && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Settlement
          </Text>

          <Text style={styles.meta}>
            Settled Cash: KES {settlement.settledCash}
          </Text>

          <Text style={styles.meta}>
            Unsettled Cash: KES {settlement.unsettledCash}
          </Text>

          <Text style={styles.meta}>
            Available Cash: KES {settlement.availableCash}
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        Broker Accounts
      </Text>

      {brokers.map((broker) => (
        <View key={broker.broker} style={styles.rowCard}>
          <View>
            <Text style={styles.symbol}>
              {broker.broker}
            </Text>

            <Text style={styles.meta}>
              {broker.accountNumber}
            </Text>
          </View>

          <View>
            <Text style={styles.value}>
              KES {broker.buyingPower}
            </Text>

            <Text
              style={
                broker.preferred
                  ? styles.green
                  : styles.meta
              }
            >
              {broker.preferred
                ? "Preferred"
                : "Available"}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 55,
    paddingHorizontal: 16
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 18
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16
  },

  rowCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },

  label: {
    color: "#94a3b8",
    marginBottom: 6
  },

  bigValue: {
    color: "#22d3ee",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8
  },

  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10
  },

  symbol: {
    color: "white",
    fontSize: 18,
    fontWeight: "800"
  },

  value: {
    color: "#e2e8f0",
    fontWeight: "800",
    textAlign: "right"
  },

  meta: {
    color: "#94a3b8",
    marginTop: 4
  },

  green: {
    color: "#22c55e",
    fontWeight: "800",
    marginTop: 4
  },

  red: {
    color: "#ef4444",
    fontWeight: "800",
    marginTop: 4
  }
});