import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  userGetItem,
  userSetItem
} from "../../src/auth/userStorage";


export async function saveProfile(partial){

const raw=
await userGetItem("investorProfile");

const existing=
raw
?JSON.parse(raw)
:{};

const merged={
...existing,
...partial
};

await userGetItem("investorProfile",
JSON.stringify(merged)
);

return merged;

}