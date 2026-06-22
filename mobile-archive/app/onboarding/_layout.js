import { Stack } from "expo-router";

export default function OnboardingLayout() {

return(

<Stack
screenOptions={{
headerShown:false,
animation:"slide_from_right"
}}
>

<Stack.Screen name="welcome"/>
<Stack.Screen name="name"/>
<Stack.Screen name="goal"/>
<Stack.Screen name="experience"/>
<Stack.Screen name="horizon"/>
<Stack.Screen name="risk"/>
<Stack.Screen name="broker-question"/>
<Stack.Screen name="upload-portfolio"/>
<Stack.Screen name="smart-portfolio"/>
<Stack.Screen name="connect-broker" />
<Stack.Screen name="recommend-broker" />

</Stack>

);

}