import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, StyleSheet, Alert, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import API from "../../src/api";
import { Page, Header, Card, CTA, Disclaimer } from "../../src/components/ProTradingUI";
import GlobalAccountHeader from "../../src/components/GlobalAccountHeader";
import NSEOrderBook from "../../src/components/NSEOrderBook";
import NSEOrderEntry from "../../src/components/NSEOrderEntry";
import SecurityDropdownModal from "../../src/components/SecurityDropdownModal";
import PortfolioImpactModal from "../../src/components/PortfolioImpactModal";
import CoachGDecisionModal from "../../src/components/CoachGDecisionModal";
import AISignalCard from "../../src/components/AISignalCard";
import { P } from "../../src/theme/proTheme";
import { ref } from "../../src/utils/money";
import { getPriceBand, isPriceAllowed } from "../../src/utils/priceBands";

function format2(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function cleanQty(value) {
  const n = Math.floor(Number(value || 0));
  return String(Math.max(1, n));
}

function getBestOffer(market) {
  const ask = market?.depth?.asks?.[0];
  return {
    price: Number(ask?.price || market?.offerPrice || market?.bestOffer || market?.price || market?.lastPrice || 0),
    qty: Number(ask?.qty || market?.offerQty || market?.offerQuantity || market?.volume || 100)
  };
}

function getBestBid(market) {
  const bid = market?.depth?.bids?.[0];
  return {
    price: Number(bid?.price || market?.bidPrice || market?.bestBid || market?.price || market?.lastPrice || 0),
    qty: Number(bid?.qty || market?.bidQty || market?.bidQuantity || market?.volume || 100)
  };
}

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
  const [price, setPrice] = useState("0.00");
  const [qty, setQty] = useState("1");

  const [orders, setOrders] = useState([]);
  const [account, setAccount] = useState(null);
  const [marketRows, setMarketRows] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [impactOpen, setImpactOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [coachRec, setCoachRec] = useState(null);
  const [allowTrade, setAllowTrade] = useState(false);
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
    setMarketRows(p.data?.data || []);
  };

  useEffect(() => {
    if (params.symbol) setSymbol(String(params.symbol));
    if (params.side) setSide(String(params.side));
  }, [params.symbol, params.side]);

  useEffect(() => { load().catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load().catch(() => {}); }, []));

  const selectedMarket = useMemo(
    () => (marketRows || []).find(x => String(x.symbol).toUpperCase() === String(symbol).toUpperCase()),
    [marketRows, symbol]
  );

  const selectedName = selectedMarket?.name || selectedMarket?.securityName || symbol;

  const bestOffer = useMemo(() => getBestOffer(selectedMarket), [selectedMarket]);
  const bestBid = useMemo(() => getBestBid(selectedMarket), [selectedMarket]);

  const currentDefault = side === "SELL" ? bestBid : bestOffer;

  const resetDefaults = (nextSide = side, market = selectedMarket) => {
    const defaults = nextSide === "SELL" ? getBestBid(market) : getBestOffer(market);
    setPrice(format2(defaults.price));
    setQty(cleanQty(defaults.qty));
  };

  useEffect(() => {
    if (selectedMarket) resetDefaults(side, selectedMarket);
  }, [selectedMarket?.symbol]);

  useEffect(() => {
    if (selectedMarket) resetDefaults(side, selectedMarket);
  }, [side]);

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
  const canConfirm = allowTrade && !duplicate && !inCooldown && !isSubmitting && priceAllowed;

  useEffect(() => {
    setCoachRec(null);
    setCoachOpen(false);
    setAllowTrade(false);
    setUserOverride(false);
    setConfirmation(null);
  }, [symbol, side, price, qty, orderType]);

  const selectSecurity = (item) => {
    setSymbol(item.symbol);
    setCoachRec(null);
    setAllowTrade(false);
    setConfirmation(null);
    resetDefaults(side, item);
  };

  const handlePickBuy = ({ price, qty }) => {
    setSide("BUY");
    setPrice(format2(price));
    setQty(cleanQty(qty));
  };

  const handlePickSell = ({ price, qty }) => {
    setSide("SELL");
    setPrice(format2(price));
    setQty(cleanQty(qty));
  };

  const openImpact = (nextSide) => {
    setSide(nextSide);

    const defaults = nextSide === "SELL" ? bestBid : bestOffer;
    if (!Number(price || 0)) {
      setPrice(format2(defaults.price));
      setQty(cleanQty(defaults.qty));
    }

    if (!priceAllowed) {
      Alert.alert("Invalid Price", `Price must be between ${priceBand.minPrice?.toFixed(2)} and ${priceBand.maxPrice?.toFixed(2)}.`);
      return;
    }

    setImpactOpen(true);
  };

  const continueToCoach = async () => {
    setImpactOpen(false);
    let rec;

    try {
      const res = await API.post("/ai/recommendation", {
        userId: "u1",
        symbol,
        side,
        price: Number(price),
        qty: Number(qty),
        cashRequired
      });
      rec = res.data;
    } catch {
      rec = {
        symbol,
        signal: "REVIEW",
        action: "REVIEW",
        confidence: 68,
        recommendationText: "Coach G recommends review before submitting this trade.",
        scores: { momentum: 60, liquidity: 60, priceRisk: 70, exposure: 65 },
        riskFlags: duplicate ? ["Duplicate order detected"] : [],
        reasons: ["Local fallback recommendation used."],
        allowAutoEnable: !duplicate && priceAllowed
      };
    }

    setCoachRec(rec);
    setCoachOpen(true);
  };

  const acceptCoach = () => {
    setAllowTrade(true);
    setUserOverride(false);
    setCoachOpen(false);
  };

  const overrideCoach = () => {
    setAllowTrade(true);
    setUserOverride(true);
    setCoachOpen(false);
  };

  const submit = async () => {
    if (!canConfirm) {
      Alert.alert("Confirmation Required", "Accept Coach G recommendation or manually override before confirming.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await API.post("/order", { userId: "u1", symbol, side, price: Number(price), qty: Number(qty) });
      setConfirmation({ ...res.data, ref: ref(symbol) });
      setCooldownUntil(Date.now() + 2000);
      setCoachRec(null);
      setAllowTrade(false);
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
        <GlobalAccountHeader />

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
          onOpenSecurity={() => setSecurityOpen(true)}
          onResetDefaults={() => resetDefaults(side, selectedMarket)}
        />

        <Card>
          <Text style={styles.section}>Coach G Decision</Text>
          <AISignalCard recommendation={coachRec} />
          {duplicate && <Text style={styles.warning}>You already placed this order with the same symbol, side, quantity, and price.</Text>}
          {allowTrade && <Text style={styles.override}>{userOverride ? "Manual override enabled." : "Coach G accepted. Confirmation enabled."}</Text>}
        </Card>

        <View style={[styles.submitWrap, !canConfirm && styles.disabled]}>
          <CTA tone={side === "BUY" ? "buy" : "sell"} onPress={submit}>
            {isSubmitting ? "Processing..." : `Confirm ${side} Order`}
          </CTA>
        </View>

        {!canConfirm && <Text style={styles.guardText}>Tap BUY/SELL, review Portfolio Impact, then accept Coach G or override to enable confirmation.</Text>}

        {confirmation && (
          <Card>
            <Text style={styles.success}>✓ Order Sent</Text>
            <Text style={styles.body}>Reference: {confirmation.ref}</Text>
            <Text style={styles.body}>{confirmation.message || "Order routed to selected broker."}</Text>
          </Card>
        )}

        <Disclaimer />
      </ScrollView>

      <SecurityDropdownModal
        visible={securityOpen}
        onClose={() => setSecurityOpen(false)}
        securities={marketRows}
        selectedSymbol={symbol}
        onSelect={selectSecurity}
      />

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

      <CoachGDecisionModal
        visible={coachOpen}
        recommendation={coachRec}
        onAccept={acceptCoach}
        onOverride={overrideCoach}
        onCancel={() => setCoachOpen(false)}
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
  guardText: { color: P.color.muted, fontSize: 11, lineHeight: 16, marginHorizontal: 18, marginBottom: 10 },
  success: { color: P.color.green, fontSize: 18, fontWeight: "900", marginBottom: 8 },
  body: { color: P.color.text, lineHeight: 20, marginTop: 4 }
});
