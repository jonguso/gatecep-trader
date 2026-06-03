import { View, Text, Pressable, StyleSheet } from "react-native";
import { COLORS } from "./config";

export function Card({ title, children }) {
  return <View style={s.card}>{!!title && <Text style={s.cardTitle}>{title}</Text>}{children}</View>;
}

export function PrimaryButton({ children, onPress, tone = "gold" }) {
  return <Pressable onPress={onPress} style={[s.button, tone === "green" && s.greenBtn, tone === "red" && s.redBtn]}><Text style={tone === "gold" ? s.darkText : s.buttonText}>{children}</Text></Pressable>;
}

export function RiskDisclaimer() {
  return <View style={s.disclaimer}><Text style={s.disclaimerText}>Coach G provides AI-assisted analysis only. It does not guarantee returns. Confirm all trades through your selected licensed broker.</Text></View>;
}

const s = StyleSheet.create({
  card:{backgroundColor:COLORS.card,borderWidth:1,borderColor:COLORS.border,borderRadius:14,padding:14,marginBottom:12},
  cardTitle:{color:COLORS.white,fontSize:18,fontWeight:"800",marginBottom:8},
  button:{backgroundColor:COLORS.gold,padding:14,borderRadius:10,marginTop:10},
  greenBtn:{backgroundColor:COLORS.green},
  redBtn:{backgroundColor:COLORS.red},
  buttonText:{color:COLORS.white,fontWeight:"900",textAlign:"center"},
  darkText:{color:"#111827",fontWeight:"900",textAlign:"center"},
  disclaimer:{backgroundColor:"#111827",borderWidth:1,borderColor:COLORS.border,padding:12,borderRadius:12,marginTop:8,marginBottom:12},
  disclaimerText:{color:COLORS.gold,fontSize:12,lineHeight:18}
});
