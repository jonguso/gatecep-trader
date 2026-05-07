import { Modal, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import API from "../api";
import { kes } from "../utils/money";
import { normalizePriceInput, normalizeQtyInput } from "../utils/tradeDefaults";
import PortfolioImpactModal from "./PortfolioImpactModal";
import CoachGDecisionModal from "./CoachGDecisionModal";

export default function OrderEntrySheet({ visible, onClose, side="BUY", symbol, name, qty, setQty, price, setPrice, priceBand, orderType, setOrderType, validity, setValidity, mode, setMode, onSubmitted }) {
  const isBuy = side === "BUY";
  const color = isBuy ? "#2F80C1" : "#C92835";
  const orderValue = Number(qty || 0) * Number(price || 0);
  const brokerFee = orderValue * 0.015, nseLevy = orderValue * 0.0012, cdsFee = isBuy ? orderValue * 0.0006 : 0, cdscLevy = orderValue * 0.0005;
  const cashRequired = orderValue + brokerFee + nseLevy + cdsFee + cdscLevy;
  const estimatedProceeds = orderValue - (brokerFee + nseLevy + cdscLevy);
  const [impactOpen,setImpactOpen]=useState(false), [coachOpen,setCoachOpen]=useState(false), [coachRec,setCoachRec]=useState(null);

  const requestCoach = async () => {
    setImpactOpen(false);
    try {
      const r = await API.post("/ai/recommendation", { userId:"u1", symbol, side, price:Number(price), qty:Number(qty), cashRequired });
      setCoachRec(r.data);
    } catch {
      setCoachRec({ symbol, signal:side, action:side, confidence:72, recommendationText:`Coach G provisional ${side} signal.`, riskFlags:[], reasons:["Fallback recommendation."] });
    }
    setCoachOpen(true);
  };

  const submit = async () => {
    setCoachOpen(false);
    try {
      const r = await API.post("/order", { userId:"u1", symbol, side, price:Number(price), qty:Number(qty) });
      onSubmitted?.(r.data);
      onClose?.();
    } catch(e) { Alert.alert("Order Failed", e.response?.data?.error || e.message); }
  };

  return <>
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}><View style={styles.sheet}>
        <View style={[styles.banner,{backgroundColor:color}]}><View><Text style={styles.bannerSymbol}>{symbol}</Text><Text style={styles.bannerText}>{side} QTY {qty || 0} @ KES {Number(price || 0).toFixed(2)} → {kes(orderValue)}</Text></View><Pressable onPress={onClose}><Text style={styles.close}>×</Text></Pressable></View>
        <Text style={styles.section}>Order Entry</Text>
        <Text style={styles.label}>Security</Text><View style={styles.disabled}><Text style={styles.disabledText}>{symbol}</Text><Text style={styles.small}>{name}</Text></View>
        <View style={styles.row}><Box label="Instrument Type" value="Normal"/><View style={styles.half}><Text style={styles.label}>Quantity</Text><TextInput value={String(qty)} onChangeText={v=>setQty(normalizeQtyInput(v))} keyboardType="numeric" style={styles.input}/><Text style={styles.small}>Lot size 1</Text></View></View>
        <View style={styles.row}><Segment label="Order Type" value={orderType} setValue={setOrderType} values={["LIMIT","MARKET"]} color={color} isBuy={isBuy}/><View style={styles.half}><Text style={styles.label}>Price</Text><TextInput value={String(price)} onChangeText={v=>setPrice(normalizePriceInput(v))} keyboardType="decimal-pad" style={styles.input}/><Text style={styles.small}>{priceBand?.minPrice?.toFixed(2)} to {priceBand?.maxPrice?.toFixed(2)}</Text></View></View>
        <View style={styles.row}><Segment label="Validity" value={validity} setValue={setValidity} values={["DAY","GTD"]} color={color} isBuy={isBuy}/><Segment label="Trading Mode" value={mode} setValue={setMode} values={["Delivery","Intraday"]} color={color} isBuy={isBuy}/></View>
        <Pressable onPress={()=>setImpactOpen(true)} style={[styles.submit,{backgroundColor:color}]}><Text style={styles.submitText}>{isBuy ? "Buy" : "Sell"}</Text></Pressable>
      </View></View>
    </Modal>
    <PortfolioImpactModal visible={impactOpen} onCancel={()=>setImpactOpen(false)} onOk={requestCoach} side={side} ledgerBalance={0} orderValue={orderValue} brokerFee={brokerFee} nseLevy={nseLevy} cdsFee={cdsFee} cdscLevy={cdscLevy} cashRequired={cashRequired} estimatedProceeds={estimatedProceeds}/>
    <CoachGDecisionModal visible={coachOpen} recommendation={coachRec} onAccept={submit} onOverride={submit} onCancel={()=>setCoachOpen(false)}/>
  </>;
}
function Box({label,value}){return <View style={styles.half}><Text style={styles.label}>{label}</Text><View style={styles.disabledNoMargin}><Text style={styles.disabledText}>{value}</Text></View></View>}
function Segment({label,value,setValue,values,color,isBuy}){return <View style={styles.half}><Text style={styles.label}>{label}</Text><View style={styles.segment}>{values.map(x=><Pressable key={x} onPress={()=>setValue(x)} style={[styles.segBtn,value===x&&{backgroundColor:isBuy?"#BFE3FF":"#FAD1D5"}]}><Text style={[styles.segText,value===x&&{color}]}>{x}</Text></Pressable>)}</View></View>}
const styles=StyleSheet.create({backdrop:{flex:1,justifyContent:"flex-end",backgroundColor:"rgba(0,0,0,.45)"},sheet:{backgroundColor:"#fff",maxHeight:"88%",borderTopLeftRadius:18,borderTopRightRadius:18,overflow:"hidden",paddingBottom:18},banner:{padding:14,flexDirection:"row",justifyContent:"space-between"},bannerSymbol:{color:"#fff",fontSize:18,fontWeight:"900"},bannerText:{color:"#fff",marginTop:4},close:{color:"#fff",fontSize:30},section:{color:"#111827",fontSize:20,fontWeight:"900",padding:14},label:{color:"#6B7280",fontWeight:"700",marginBottom:6},disabled:{borderWidth:1,borderColor:"#E5E7EB",backgroundColor:"#F9FAFB",borderRadius:4,minHeight:54,paddingHorizontal:10,justifyContent:"center",marginHorizontal:14,marginBottom:12},disabledNoMargin:{borderWidth:1,borderColor:"#E5E7EB",backgroundColor:"#F9FAFB",borderRadius:4,minHeight:54,paddingHorizontal:10,justifyContent:"center"},disabledText:{color:"#111827",fontSize:16},small:{color:"#6B7280",fontSize:11,marginTop:3,fontStyle:"italic"},row:{flexDirection:"row",gap:14,paddingHorizontal:14,marginBottom:14},half:{flex:1},input:{borderWidth:1,borderColor:"#E5E7EB",borderRadius:4,minHeight:54,paddingHorizontal:10,color:"#111827",fontSize:16},segment:{flexDirection:"row",borderWidth:1,borderColor:"#E5E7EB",borderRadius:4,overflow:"hidden",minHeight:54},segBtn:{flex:1,alignItems:"center",justifyContent:"center"},segText:{color:"#111827",fontWeight:"700"},submit:{minHeight:66,alignItems:"center",justifyContent:"center"},submitText:{color:"#fff",fontSize:20,fontWeight:"900"}});
