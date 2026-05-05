import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, StyleSheet, Alert, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import API from "../../src/api";
import { Page, Header, Card, CTA, ActivityRow, Disclaimer } from "../../src/components/ProTradingUI";
import NSEOrderBook from "../../src/components/NSEOrderBook";
import NSEOrderEntry from "../../src/components/NSEOrderEntry";
import PortfolioImpactModal from "../../src/components/PortfolioImpactModal";
import AISignalCard from "../../src/components/AISignalCard";
import { P } from "../../src/theme/proTheme";
import { ref } from "../../src/utils/money";
import { getPriceBand, isPriceAllowed } from "../../src/utils/priceBands";

function isDuplicateOrder(orders, { symbol, side, qty, price }) {
  return (orders || []).some(o => {
    const active = ["PENDING", "OPEN", "ROUTED", "ACCEPTED", "NEW"].includes(String(o.status || "").toUpperCase());
    return active &&
      String(o.symbol).toUpperCase() === String(symbol).toUpperCase() &&
      String(o.side).toUpperCase() === String(side).toUpperCase() &&
      Number(o.qty || o.originalQty || 0) === Number(qty || 0) &&
      Number(o.price || 0) === Number(price || 0);
  });
}

export default function Trade() {
  const params = useLocalSearchParams();
  const [symbol, setSymbol] = useState(params.symbol || "SCOM");
  const [side, setSide] = useState(params.side || "BUY");
  const [orderType, setOrderType] = useState("LIMIT");
  const [validity, setValidity] = useState("DAY");
  const [mode, setMode] = useState("Delivery");
  const [price, setPrice] = useState("15");
  const [qty, setQty] = useState("100");

  const [orders, setOrders] = useState([]);
  const [account, setAccount] = useState(null);
  const [marketRows, setMarketRows] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [impactOpen, setImpactOpen] = useState(false);
  const [coachRec, setCoachRec] = useState(null);
  const [userOverride, setUserOverride] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  const load = async () => {
    const [o, a, p] = await Promise.all([
      API.get("/orders?userId=u1"),
      API.get("/account/u1"),
      API.get("/prices")
    ]);
    setOrders(o.data || []);
    setAccount(a.data);
    setMarketRows(p.data.data || []);
  };

  useEffect(() => {
    if (params.symbol) setSymbol(params.symbol);
    if (params.side) setSide(params.side);
  }, [params.symbol, params.side]);

  useEffect(() => { load().catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load().catch(() => {}); }, []));

  const selectedMarket = useMemo(
    () => (marketRows || []).find(x => String(x.symbol).toUpperCase() === String(symbol).toUpperCase()),
    [marketRows, symbol]
  );

  const selectedName = selectedMarket?.name || selectedMarket?.securityName || symbol;
  const referencePrice = Number(selectedMarket?.offerPrice || selectedMarket?.bestOffer || selectedMarket?.price || selectedMarket?.lastPrice || price || 0);
  const priceBand = useMemo(() => getPriceBand(referencePrice, 0.10, 0.10), [referencePrice]);
  const priceAllowed = isPriceAllowed(price, priceBand);

  const orderValue = Number(price || 0) * Number(qty || 0);
  const brokerFee = orderValue * 0.015;
  const nseLevy = orderValue * 0.0012;
  const cdsFee = side === "BUY" ? orderValue * 0.0006 : 0;
  const cdscLevy = orderValue * 0.0005;
  const cashRequired = orderValue + brokerFee + nseLevy + cdsFee + cdscLevy;
  const estimatedProceeds = orderValue - (brokerFee + nseLevy + cdscLevy);
  const ledgerBalance = Number(account?.cash || 0);

  const duplicate = isDuplicateOrder(orders, { symbol, side, qty, price });
  const inCooldown = Date.now() < cooldownUntil;
  const canConfirm = (coachRec?.allowAutoEnable || userOverride) && !duplicate && !inCooldown && !isSubmitting && priceAllowed;

  useEffect(() => {
    setCoachRec(null);
    setUserOverride(false);
    setConfirmation(null);
  }, [symbol, side, price, qty, orderType]);

  const handlePickBuy = ({ price, qty }) => {
    setSide("BUY");
    setPrice(String(price));
    setQty(String(Math.min(Number(qty || 100), 1000)));
  };

  const handlePickSell = ({ price, qty }) => {
    setSide("SELL");
    setPrice(String(price));
    setQty(String(Math.min(Number(qty || 100), 1000)));
  };

  const openImpact = (nextSide) => {
    setSide(nextSide);
    if (!priceAllowed) {
      Alert.alert("Invalid Price", "Price must be within allowed range.");
      return;
    }
    setImpactOpen(true);
  };

  const continueToCoach = async () => {
    setImpactOpen(false);
    try {
      const res = await API.post("/ai/recommendation", {
        userId: "u1",
        symbol,
        side,
        price: Number(price),
        qty: Number(qty),
        cashRequired
      });
      setCoachRec(res.data);
    } catch {
      setCoachRec({
        symbol,
        signal: "REVIEW",
        action: "REVIEW",
        confidence: 68,
        recommendationText: "Coach G recommends review before submitting this trade.",
        scores: { momentum: 60, liquidity: 60, priceRisk: 70, exposure: 65 },
        riskFlags: duplicate ? ["Duplicate order detected"] : [],
        reasons: ["Local fallback recommendation used."],
        allowAutoEnable: !duplicate && priceAllowed
      });
    }
  };

  const submit = async () => {
    if (!canConfirm) {
      Alert.alert("Confirmation Required", "Accept Coach G recommendation or manually override before confirming.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await API.post("/order", {
        userId: "u1",
        symbol,
        side,
        price: Number(price),
        qty: Number(qty)
      });

      setConfirmation({ ...res.data, ref: ref(symbol) });
      setCooldownUntil(Date.now() + 2000);
      setCoachRec(null);
      setUserOverride(false);
      await load();
    } catch (e) {
      Alert.alert("Order Failed", e.response?.data?.error || "Order failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page>
      <Header title="Trade" subtitle="NSE-style order entry" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <NSEOrderBook symbol={symbol} name={selectedName} market={selectedMarket} onPickBuy={handlePickBuy} onPickSell={handlePickSell} />

        <NSEOrderEntry
          symbol={symbol}
          name={selectedName}
          side={side}
          setSide={setSide}
          qty={qty}
          setQty={setQty}
          price={price}
          setPrice={setPrice}
          orderType={orderType}
          setOrderType={setOrderType}
          validity={validity}
          setValidity={setValidity}
          mode={mode}
          setMode={setMode}
          priceBand={priceBand}
          onOpenImpact={openImpact}
        />

        <Card>
          <Text style={styles.section}>Coach G Decision</Text>
          <AISignalCard recommendation={coachRec} />
          {duplicate && <Text style={styles.warning}>You already placed this order with the same symbol, side, quantity, and price.</Text>}
          {coachRec && !coachRec.allowAutoEnable && (
            <CTA tone="ghost" onPress={() => setUserOverride(true)}>Ignore & Proceed Manually</CTA>
          )}
          {userOverride && <Text style={styles.override}>Manual override enabled.</Text>}
        </Card>

        <View style={[styles.submitWrap, !canConfirm && styles.disabled]}>
          <CTA tone={side === "BUY" ? "buy" : "sell"} onPress={submit}>
            {isSubmitting ? "Processing..." : `Confirm ${side} Order`}
          </CTA>
        </View>

        {confirmation && (
          <Card>
            <Text style={styles.success}>✓ Order Sent</Text>
            <Text style={styles.body}>Reference: {confirmation.ref}</Text>
            <Text style={styles.body}>{confirmation.message || "Order routed to selected broker."}</Text>
          </Card>
        )}

        <Card>
          <Text style={styles.section}>Recent Activity</Text>
          {orders.length === 0 && <Text style={styles.empty}>No recent trades</Text>}
          {orders.slice(0, 5).map(o => <ActivityRow key={o.id} item={o} />)}
        </Card>

        <Disclaimer />
      </ScrollView>

      <PortfolioImpactModal
        visible={impactOpen}
        onCancel={() => setImpactOpen(false)}
        onOk={continueToCoach}
        side={side}
        ledgerBalance={ledgerBalance}
        orderValue={orderValue}
        brokerFee={brokerFee}
        nseLevy={nseLevy}
        cdsFee={cdsFee}
        cdscLevy={cdscLevy}
        cashRequired={cashRequired}
        estimatedProceeds={estimatedProceeds}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { color: P.color.text, fontSize: 18, fontWeight: "900", marginBottom: 8 },
  warning: { color: P.color.red, fontWeight: "900", lineHeight: 19, marginTop: 10 },
  override: { color: P.color.green, fontWeight: "900", marginTop: 10 },
  submitWrap: { marginHorizontal: 18 },
  disabled: { opacity: 0.45 },
  success: { color: P.color.green, fontSize: 18, fontWeight: "900", marginBottom: 8 },
  body: { color: P.color.text, lineHeight: 20, marginTop: 4 },
  empty: { color: P.color.muted, lineHeight: 20 }
});
