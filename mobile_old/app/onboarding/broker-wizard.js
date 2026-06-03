import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import API from "../../src/api";
import { Card, PrimaryButton, RiskDisclaimer } from "../../src/components";
import { COLORS } from "../../src/config";

const USER_ID = "u1";

export default function BrokerWizard() {
  const [step, setStep] = useState(0);
  const [brokers, setBrokers] = useState([]);
  const [brokerId, setBrokerId] = useState("mock-broker");
  const [flow, setFlow] = useState(null);
  const [personal, setPersonal] = useState({ fullName: "Demo Trader", nationalId: "", kraPin: "", phone: "" });
  const [cds, setCds] = useState({ hasCds: true, cdsAccount: "CDS-DEMO-U1" });
  const [riskProfile, setRiskProfile] = useState("BALANCED");

  useEffect(() => { API.get("/brokers").then(r => setBrokers(r.data)).catch(() => {}); }, []);
  const start = async id => { setBrokerId(id); const res = await API.post("/onboarding/start", { userId: USER_ID, brokerId: id }); setFlow(res.data); setStep(1); };
  const savePersonal = async () => { const res = await API.post("/onboarding/personal", { userId: USER_ID, brokerId, personalDetails: personal }); setFlow(res.data); setStep(2); };
  const saveCds = async () => { const res = await API.post("/onboarding/cds", { userId: USER_ID, brokerId, cdsDetails: cds }); setFlow(res.data); setStep(3); };
  const uploadDocs = async () => { const res = await API.post("/onboarding/document", { userId: USER_ID, brokerId, documentType: "NATIONAL_ID", fileName: "demo-national-id.pdf", reference: "mock-upload" }); setFlow(res.data); setStep(4); };
  const saveRisk = async () => { const res = await API.post("/onboarding/risk", { userId: USER_ID, brokerId, riskProfile: { profile: riskProfile } }); setFlow(res.data); setStep(5); };
  const accept = async () => { const res = await API.post("/onboarding/terms", { userId: USER_ID, brokerId, accepted: true }); setFlow(res.data); setStep(6); };
  const submit = async () => { const res = await API.post("/onboarding/submit", { userId: USER_ID, brokerId }); setFlow(res.data); setStep(7); };
  const approveDemo = async () => { await API.post("/onboarding/approve", { userId: USER_ID, brokerId, brokerCustomerId: `BRK-${brokerId}-U1`, cdsAccount: cds.cdsAccount }); router.replace("/brokers"); };

  return (
    <ScrollView style={s.page}>
      <Text style={s.title}>Broker Onboarding</Text>
      <Text style={s.subtitle}>Step {step + 1} of 8</Text>
      {flow && <Card title="Progress"><Text style={s.muted}>Status: {flow.status}</Text><Text style={s.muted}>Completed: {flow.completedSteps?.join(", ")}</Text></Card>}
      {step === 0 && <Card title="Choose Broker">{brokers.map(b => <Pressable key={b.id} style={s.option} onPress={() => start(b.id)}><Text style={s.optionTitle}>{b.name}</Text><Text style={s.muted}>{b.status}</Text></Pressable>)}</Card>}
      {step === 1 && <Card title="Personal Details"><Input label="Full Name" value={personal.fullName} onChangeText={v => setPersonal({...personal, fullName:v})}/><Input label="National ID" value={personal.nationalId} onChangeText={v => setPersonal({...personal, nationalId:v})}/><Input label="KRA PIN" value={personal.kraPin} onChangeText={v => setPersonal({...personal, kraPin:v})}/><Input label="Phone" value={personal.phone} onChangeText={v => setPersonal({...personal, phone:v})}/><PrimaryButton onPress={savePersonal}>Save and Continue</PrimaryButton></Card>}
      {step === 2 && <Card title="CDS Account"><Input label="CDS Account" value={cds.cdsAccount} onChangeText={v => setCds({...cds, cdsAccount:v})}/><PrimaryButton onPress={saveCds}>Save CDS Details</PrimaryButton></Card>}
      {step === 3 && <Card title="KYC Documents"><Text style={s.muted}>Production app should upload National ID, KRA PIN certificate, and proof of address securely.</Text><PrimaryButton onPress={uploadDocs}>Upload Demo Documents</PrimaryButton></Card>}
      {step === 4 && <Card title="Risk Profile">{["CONSERVATIVE","BALANCED","GROWTH"].map(x => <Pressable key={x} onPress={() => setRiskProfile(x)} style={[s.option, riskProfile === x && s.active]}><Text style={s.optionTitle}>{x}</Text></Pressable>)}<PrimaryButton onPress={saveRisk}>Save Risk Profile</PrimaryButton></Card>}
      {step === 5 && <Card title="Terms and Risk Disclosure"><RiskDisclaimer /><PrimaryButton onPress={accept}>I Accept</PrimaryButton></Card>}
      {step === 6 && <Card title="Submit for Broker Review"><Text style={s.muted}>Your broker will verify the submitted information before trading is enabled.</Text><PrimaryButton onPress={submit}>Submit for Review</PrimaryButton></Card>}
      {step === 7 && <Card title="Broker Review"><Text style={s.muted}>Status: Pending broker review.</Text><Text style={s.muted}>For demo/testing, approve instantly.</Text><PrimaryButton onPress={approveDemo}>Approve Demo Broker Link</PrimaryButton></Card>}
    </ScrollView>
  );
}

function Input({ label, value, onChangeText }) { return <><Text style={s.label}>{label}</Text><TextInput style={s.input} value={value} onChangeText={onChangeText} /></>; }
const s = StyleSheet.create({page:{flex:1,backgroundColor:COLORS.bg,padding:14},title:{color:COLORS.gold,fontSize:26,fontWeight:"900"},subtitle:{color:COLORS.muted,marginBottom:14},muted:{color:COLORS.muted,marginTop:6},label:{color:COLORS.muted,marginTop:10},input:{backgroundColor:COLORS.bg,color:COLORS.white,padding:12,borderRadius:10,borderWidth:1,borderColor:COLORS.border,marginTop:4},option:{backgroundColor:"#111827",padding:12,borderRadius:10,borderWidth:1,borderColor:COLORS.border,marginBottom:8},active:{borderColor:COLORS.gold},optionTitle:{color:COLORS.white,fontWeight:"900"}});
