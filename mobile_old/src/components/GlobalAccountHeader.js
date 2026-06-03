import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import API from "../api";
import { P } from "../theme/proTheme";
import { kes } from "../utils/money";

function mergePortfolioWithPrices(portfolioRows, priceRows) {
  const priceMap = Object.fromEntries(
    (priceRows || []).map(x => [
      x.symbol,
      Number(x.price || x.lastPrice || x.marketPrice || 0)
    ])
  );

  return (portfolioRows || [])
    .filter(h => Number(h.qty || 0) > 0)
    .map(h => {
      const qty = Number(h.qty || 0);
      const avgPrice = Number(h.avgPrice || 0);
      const marketPrice = Number(h.marketPrice || priceMap[h.symbol] || avgPrice || 0);
      return {
        ...h,
        qty,
        avgPrice,
        marketPrice,
        marketValue: qty * marketPrice,
        investedValue: qty * avgPrice
      };
    });
}

export default function GlobalAccountHeader() {
  const [account, setAccount] = useState({ cash: 0 });
  const [portfolio, setPortfolio] = useState([]);
  const [prices, setPrices] = useState([]);

  const load = async () => {
    try {
      const [a, pf, p] = await Promise.all([
        API.get("/account/u1"),
        API.get("/portfolio/u1"),
        API.get("/prices")
      ]);

      setAccount(a.data || { cash: 0 });
      setPortfolio(pf.data || []);
      setPrices(p.data?.data || []);
    } catch {
      // Keep header visible even if API is temporarily unavailable.
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const holdings = useMemo(
    () => mergePortfolioWithPrices(portfolio, prices),
    [portfolio, prices]
  );

  const investedValue = holdings.reduce((sum, h) => sum + Number(h.investedValue || 0), 0);
  const currentValue = holdings.reduce((sum, h) => sum + Number(h.marketValue || 0), 0);
  const pnl = currentValue - investedValue;
  const up = pnl >= 0;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>AVAILABLE FUNDS</Text>
      <Text style={styles.value}>{kes(account?.cash || 0)}</Text>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View>
          <Text style={styles.smallLabel}>Invested</Text>
          <Text style={styles.smallValue}>{kes(investedValue)}</Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.smallLabel}>Current</Text>
          <Text style={styles.smallValue}>{kes(currentValue)}</Text>
        </View>
      </View>

      <Text style={[styles.pnl, { color: up ? P.color.green : P.color.red }]}>
        {up ? "▲" : "▼"} {kes(pnl)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: P.color.card,
    borderRadius: P.radius.xl,
    borderWidth: 1,
    borderColor: P.color.border,
    padding: 18,
    marginHorizontal: P.spacing.screen,
    marginBottom: 14
  },
  label: {
    color: P.color.muted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8
  },
  value: {
    color: P.color.text,
    fontSize: 32,
    fontWeight: "900",
    marginTop: 8
  },
  divider: {
    height: 1,
    backgroundColor: P.color.border,
    marginVertical: 14
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  smallLabel: {
    color: P.color.muted,
    fontSize: 11,
    fontWeight: "700"
  },
  smallValue: {
    color: P.color.text,
    fontWeight: "900",
    marginTop: 4
  },
  pnl: {
    marginTop: 10,
    fontWeight: "900"
  }
});
