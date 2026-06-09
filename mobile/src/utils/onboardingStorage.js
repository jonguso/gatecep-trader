import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveProfile(partial){

const raw=
await AsyncStorage.getItem(
"gatecepInvestorProfile"
);

const existing=
raw
?JSON.parse(raw)
:{};

const merged={
...existing,
...partial
};

await AsyncStorage.setItem(
"gatecepInvestorProfile",
JSON.stringify(merged)
);

return merged;

}