import { ScrollView, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Card, PrimaryButton, RiskDisclaimer } from "../src/components";
import { COLORS } from "../src/config";

export default function Onboarding() {
  return (
    <ScrollView style={s.page}>
      <Text style={s.logo}>GATECEP</Text>
      <Text style={s.title}>AI Trading Coach + Multi-Broker Connector</Text>
      <Text style={s.text}>Track NSE stocks, connect your preferred broker, get AI-assisted Buy/Sell/Hold insights, and confirm trades through your licensed broker.</Text>
      <Card title="How GATECEP works">
        <Text style={s.item}>1. Choose or link your broker</Text>
        <Text style={s.item}>2. Review Coach G AI analysis</Text>
        <Text style={s.item}>3. Confirm orders with your selected broker</Text>
        <Text style={s.item}>4. Track portfolio and risk</Text>
      </Card>
      <RiskDisclaimer />
      <PrimaryButton onPress={() => router.replace("/dashboard")}>Continue to Demo</PrimaryButton>
    </ScrollView>
  );
}

const s = StyleSheet.create({page:{flex:1,backgroundColor:COLORS.bg,padding:20},logo:{color:COLORS.gold,fontSize:34,fontWeight:"900",marginTop:30},title:{color:COLORS.white,fontSize:24,fontWeight:"800",marginTop:12},text:{color:COLORS.muted,marginVertical:14,lineHeight:22},item:{color:COLORS.white,marginVertical:5}});
