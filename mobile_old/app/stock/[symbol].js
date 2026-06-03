import { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Polyline, Line, Text as SvgText } from "react-native-svg";
import API from "../../src/api";
import { Page, Header, Card, CTA, InfoRow, Disclaimer } from "../../src/components/ProTradingUI";
import { P } from "../../src/theme/proTheme";
import { kes, pct } from "../../src/utils/money";
import { compactNumber, kesCompact } from "../../src/utils/marketFormat";

function generateChart(base = 15) {
  return Array.from({ length: 44 }, (_, i) => Number((base + Math.sin(i / 3) * 1.8 + Math.cos(i / 5) * 0.9 + i * 0.025).toFixed(2)));
}

function FullLineChart({ data, up }) {
  const width = 340;
  const height = 230;
  const pad = 18;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = pad + (i / Math.max(1, data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <View style={styles.chartWrap}>
      <Svg width={width} height={height}>
        {[0, 1, 2, 3].map(i => (
          <Line key={i} x1={pad} x2={width - pad} y1={pad + i * 55} y2={pad + i * 55} stroke={P.color.border} strokeWidth="1" />
        ))}
        <Polyline points={points} fill="none" stroke={up ? P.color.green : P.color.red} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <SvgText x={pad} y={height - 4} fill={P.color.muted} fontSize="10">1D</SvgText>
        <SvgText x={width - 56} y={height - 4} fill={P.color.muted} fontSize="10">Live</SvgText>
      </Svg>
    </View>
  );
}

export default function StockDetail() {
  const params = useLocalSearchParams();
  const symbol = params.symbol || "SCOM";
  const [candles, setCandles] = useState([]);
  const [rankRow, setRankRow] = useState(null);

  useEffect(() => {
    API.get(`/candles/${symbol}`).then(r => {
      const arr = Array.isArray(r.data) ? r.data.map(x => x.close || x.price || 0) : [];
      setCandles(arr.length ? arr : generateChart(Number(params.price || 15)));
    }).catch(() => setCandles(generateChart(Number(params.price || 15))));

    API.get("/market/rankings").then(r => {
      const all = [...(r.data.gainers || []), ...(r.data.losers || []), ...(r.data.movers || [])];
      setRankRow(all.find(x => x.symbol === symbol));
    }).catch(() => {});
  }, [symbol]);

  const data = candles.length ? candles : generateChart(Number(params.price || 15));
  const latest = rankRow?.price || data[data.length - 1] || Number(params.price || 0);
  const first = data[0] || latest;
  const change = rankRow?.changePct ?? ((latest - first) / (first || 1)) * 100;
  const up = change >= 0;
  const volume = rankRow?.volume || Number(params.volume || 0);
  const turnover = rankRow?.turnover || Number(params.turnover || latest * volume);

  return (
    <Page>
      <Header
        title={symbol}
        subtitle={params.name || "NSE security"}
        right={rankRow?.isHot ? <Text style={styles.hot}>🔥 HOT</Text> : <Text style={up ? styles.up : styles.down}>{pct(change)}</Text>}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.price}>{kes(latest)}</Text>
          <Text style={up ? styles.up : styles.down}>{up ? "▲" : "▼"} {pct(change)}</Text>
          <FullLineChart data={data} up={up} />
        </Card>

        <Card>
          <Text style={styles.section}>Market Stats</Text>
          <InfoRow label="Last Price" value={kes(latest)} />
          <InfoRow label="Session Change" value={pct(change)} valueTone={up ? "green" : "red"} />
          <InfoRow label="Volume" value={compactNumber(volume)} />
          <InfoRow label="Turnover" value={kesCompact(turnover)} />
          <InfoRow label="Coach G Hot Score" value={rankRow?.hotScore != null ? String(rankRow.hotScore) : "-"} />
          <InfoRow label="Settlement" value="T+3" />
        </Card>

        <CTA tone="buy" onPress={() => router.push({ pathname: "/trade", params: { symbol, side: "BUY" } })}>Buy {symbol}</CTA>
        <CTA tone="sell" onPress={() => router.push({ pathname: "/trade", params: { symbol, side: "SELL" } })}>Sell {symbol}</CTA>
        <CTA tone="ghost" onPress={() => router.push({ pathname: "/coach", params: { symbol } })}>Ask Coach G</CTA>

        <Disclaimer />
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  price: { color: P.color.text, fontSize: 34, fontWeight: "900", marginBottom: 4 },
  up: { color: P.color.green, fontWeight: "900" },
  down: { color: P.color.red, fontWeight: "900" },
  hot: { color: P.color.blue, fontWeight: "900" },
  chartWrap: { marginTop: 18, alignItems: "center" },
  section: { color: P.color.text, fontSize: 18, fontWeight: "900", marginBottom: 8 }
});
