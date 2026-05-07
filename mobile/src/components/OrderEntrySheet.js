import { Modal, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useEffect, useState } from "react";
import API from "../api";
import { kes } from "../utils/money";
import { normalizePriceInput, normalizeQtyInput } from "../utils/tradeDefaults";
import PortfolioImpactModal from "./PortfolioImpactModal";
import CoachGDecisionModal from "./CoachGDecisionModal";
import BrokerSelectorModal from "./BrokerSelectorModal";
import { FALLBACK_BROKERS } from "../data/brokers";

export default function OrderEntrySheet({
  visible,
  onClose,
  side = "BUY",
  symbol,
  name,
  qty,
  setQty,
  price,
  setPrice,
  priceBand,
  orderType,
  setOrderType,
  validity,
  setValidity,
  mode,
  setMode,
  onSubmitted
}) {
  const isBuy = side === "BUY";
  const color = isBuy ? "#2F80C1" : "#C92835";

  const [impactOpen, setImpactOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachRec, setCoachRec] = useState(null);
  const [brokerOpen, setBrokerOpen] = useState(false);
  const [brokers, setBrokers] = useState(FALLBACK_BROKERS);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState(FALLBACK_BROKERS[0]);

  const orderValue = Number(qty || 0) * Number(price || 0);
  const brokerFee = orderValue * 0.015;
  const nseLevy = orderValue * 0.0012;
  const cdsFee = isBuy ? orderValue * 0.0006 : 0;
  const cdscLevy = orderValue * 0.0005;
  const cashRequired = orderValue + brokerFee + nseLevy + cdsFee + cdscLevy;
  const estimatedProceeds = orderValue - (brokerFee + nseLevy + cdscLevy);

  useEffect(() => {
    if (!visible) return;

    async function loadBrokers() {
      try {
        const [b, l] = await Promise.all([
          API.get("/brokers"),
          API.get("/brokers/user/u1")
        ]);

        const brokerRows = b.data?.data || FALLBACK_BROKERS;
        const linkedRows = l.data?.data || [];

        setBrokers(brokerRows);
        setLinkedAccounts(linkedRows);

        const firstLinked = linkedRows[0];
        if (firstLinked) {
          const matched = brokerRows.find(x => x.id === firstLinked.brokerId);
          if (matched) setSelectedBroker(matched);
        } else if (!selectedBroker) {
          setSelectedBroker(brokerRows[0]);
        }
      } catch {
        setBrokers(FALLBACK_BROKERS);
        if (!selectedBroker) setSelectedBroker(FALLBACK_BROKERS[0]);
      }
    }

    loadBrokers();
  }, [visible]);

  const requestCoach = async () => {
    setImpactOpen(false);

    try {
      const res = await API.post("/ai/recommendation", {
        userId: "u1",
        symbol,
        side,
        price: Number(price),
        qty: Number(qty),
        cashRequired,
        brokerId: selectedBroker?.id,
        brokerName: selectedBroker?.name
      });

      setCoachRec(res.data);
    } catch {
      setCoachRec({
        symbol,
        signal: side,
        action: side,
        confidence: 72,
        recommendationText: `Coach G gives a provisional ${side} signal using ${selectedBroker?.shortName || "selected broker"}.`,
        riskFlags: [],
        reasons: [
          `Selected broker: ${selectedBroker?.name || "Not selected"}`,
          "Fallback local Coach G recommendation used."
        ]
      });
    }

    setCoachOpen(true);
  };

  const submit = async () => {
    setCoachOpen(false);

    if (!selectedBroker?.id) {
      Alert.alert("Broker Required", "Please choose a broker before submitting the order.");
      return;
    }

    const orderPayload = {
      userId: "u1",
      symbol,
      side,
      price: Number(price),
      qty: Number(qty),
      brokerId: selectedBroker.id,
      brokerName: selectedBroker.name
    };

    try {
      const routeResult = await API.post("/brokers/route-order", {
        brokerId: selectedBroker.id,
        order: orderPayload
      }).catch(() => null);

      const res = await API.post("/order", {
        ...orderPayload,
        brokerOrderId: routeResult?.data?.brokerOrderId,
        brokerStatus: routeResult?.data?.status
      });

      onSubmitted?.(res.data);
      onClose?.();
    } catch (e) {
      Alert.alert("Order Failed", e.response?.data?.error || e.message || "Order could not be submitted.");
    }
  };

  const linkBrokerPlaceholder = (broker) => {
    Alert.alert(
      "Link Broker",
      `Open Brokers screen to link your ${broker.shortName || broker.name} account first.`
    );
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={[styles.banner, { backgroundColor: color }]}>
              <View>
                <Text style={styles.bannerSymbol}>{symbol}</Text>
                <Text style={styles.bannerText}>
                  {side} QTY {qty || 0} @ KES {Number(price || 0).toFixed(2)} → {kes(orderValue)}
                </Text>
              </View>
              <Pressable onPress={onClose}>
                <Text style={styles.close}>×</Text>
              </Pressable>
            </View>

            <Text style={styles.section}>Order Entry</Text>

            <Text style={styles.label}>Broker</Text>
            <View style={styles.brokerBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.brokerName}>{selectedBroker?.name || "No broker selected"}</Text>
                <Text style={styles.small}>
                  {selectedBroker?.status || "Select broker"} · {selectedBroker?.market || "NSE"}
                </Text>
              </View>
              <Pressable onPress={() => setBrokerOpen(true)} style={styles.chooseBroker}>
                <Text style={styles.chooseBrokerText}>Choose</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Security</Text>
            <View style={styles.disabled}>
              <Text style={styles.disabledText}>{symbol}</Text>
              <Text style={styles.small}>{name}</Text>
            </View>

            <View style={styles.row}>
              <Box label="Instrument Type" value="Normal" />
              <View style={styles.half}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  value={String(qty)}
                  onChangeText={(v) => setQty(normalizeQtyInput(v))}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <Text style={styles.small}>Lot size 1</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Segment label="Order Type" value={orderType} setValue={setOrderType} values={["LIMIT", "MARKET"]} color={color} isBuy={isBuy} />
              <View style={styles.half}>
                <Text style={styles.label}>Price</Text>
                <TextInput
                  value={String(price)}
                  onChangeText={(v) => setPrice(normalizePriceInput(v))}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
                <Text style={styles.small}>
                  {priceBand?.minPrice?.toFixed(2)} to {priceBand?.maxPrice?.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <Segment label="Validity" value={validity} setValue={setValidity} values={["DAY", "GTD"]} color={color} isBuy={isBuy} />
              <Segment label="Trading Mode" value={mode} setValue={setMode} values={["Delivery", "Intraday"]} color={color} isBuy={isBuy} />
            </View>

            <Pressable onPress={() => setImpactOpen(true)} style={[styles.submit, { backgroundColor: color }]}>
              <Text style={styles.submitText}>{isBuy ? "Buy" : "Sell"}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <BrokerSelectorModal
        visible={brokerOpen}
        onClose={() => setBrokerOpen(false)}
        brokers={brokers}
        linkedAccounts={linkedAccounts}
        selectedBrokerId={selectedBroker?.id}
        onSelectBroker={setSelectedBroker}
        onLinkBroker={linkBrokerPlaceholder}
      />

      <PortfolioImpactModal
        visible={impactOpen}
        onCancel={() => setImpactOpen(false)}
        onOk={requestCoach}
        side={side}
        ledgerBalance={0}
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
        onAccept={submit}
        onOverride={submit}
        onCancel={() => setCoachOpen(false)}
      />
    </>
  );
}

function Box({ label, value }) {
  return (
    <View style={styles.half}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.disabledNoMargin}>
        <Text style={styles.disabledText}>{value}</Text>
      </View>
    </View>
  );
}

function Segment({ label, value, setValue, values, color, isBuy }) {
  return (
    <View style={styles.half}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segment}>
        {values.map((x) => (
          <Pressable
            key={x}
            onPress={() => setValue(x)}
            style={[
              styles.segBtn,
              value === x && { backgroundColor: isBuy ? "#BFE3FF" : "#FAD1D5" }
            ]}
          >
            <Text style={[styles.segText, value === x && { color }]}>{x}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop:{flex:1,justifyContent:"flex-end",backgroundColor:"rgba(0,0,0,.45)"},
  sheet:{backgroundColor:"#fff",maxHeight:"92%",borderTopLeftRadius:18,borderTopRightRadius:18,overflow:"hidden",paddingBottom:18},
  banner:{padding:14,flexDirection:"row",justifyContent:"space-between"},
  bannerSymbol:{color:"#fff",fontSize:18,fontWeight:"900"},
  bannerText:{color:"#fff",marginTop:4},
  close:{color:"#fff",fontSize:30},
  section:{color:"#111827",fontSize:20,fontWeight:"900",paddingHorizontal:14,paddingTop:14,paddingBottom:10},
  label:{color:"#6B7280",fontWeight:"700",marginBottom:6,marginHorizontal:14},
  brokerBox:{marginHorizontal:14,marginBottom:12,borderWidth:1,borderColor:"#E5E7EB",backgroundColor:"#F9FAFB",borderRadius:8,minHeight:58,paddingHorizontal:10,flexDirection:"row",alignItems:"center"},
  brokerName:{color:"#111827",fontSize:15,fontWeight:"900"},
  chooseBroker:{backgroundColor:"#0B5CFF",paddingHorizontal:12,paddingVertical:9,borderRadius:7},
  chooseBrokerText:{color:"#fff",fontWeight:"900"},
  disabled:{borderWidth:1,borderColor:"#E5E7EB",backgroundColor:"#F9FAFB",borderRadius:4,minHeight:54,paddingHorizontal:10,justifyContent:"center",marginHorizontal:14,marginBottom:12},
  disabledNoMargin:{borderWidth:1,borderColor:"#E5E7EB",backgroundColor:"#F9FAFB",borderRadius:4,minHeight:54,paddingHorizontal:10,justifyContent:"center"},
  disabledText:{color:"#111827",fontSize:16},
  small:{color:"#6B7280",fontSize:11,marginTop:3,fontStyle:"italic"},
  row:{flexDirection:"row",gap:14,paddingHorizontal:14,marginBottom:14},
  half:{flex:1},
  input:{borderWidth:1,borderColor:"#E5E7EB",borderRadius:4,minHeight:54,paddingHorizontal:10,color:"#111827",fontSize:16},
  segment:{flexDirection:"row",borderWidth:1,borderColor:"#E5E7EB",borderRadius:4,overflow:"hidden",minHeight:54},
  segBtn:{flex:1,alignItems:"center",justifyContent:"center"},
  segText:{color:"#111827",fontWeight:"700"},
  submit:{minHeight:66,alignItems:"center",justifyContent:"center"},
  submitText:{color:"#fff",fontSize:20,fontWeight:"900"}
});
