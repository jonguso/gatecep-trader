import { View, Text, StyleSheet } from "react-native";

export default function GatecepLogo({ dark = false }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.mark}><Text style={styles.markText}>G</Text></View>
      <View>
        <Text style={[styles.name, dark && styles.nameDark]}>GATECEP</Text>
        <Text style={[styles.sub, dark && styles.subDark]}>CAPITAL MARKETS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},
  mark:{width:34,height:34,borderRadius:9,backgroundColor:"#0B5CFF",alignItems:"center",justifyContent:"center"},
  markText:{color:"#fff",fontSize:24,fontWeight:"900"},
  name:{color:"#06154A",fontSize:30,fontWeight:"900",letterSpacing:1},
  nameDark:{color:"#fff"},
  sub:{color:"#0B5CFF",fontSize:9,fontWeight:"900",letterSpacing:2,marginTop:-4},
  subDark:{color:"#22D3EE"}
});
