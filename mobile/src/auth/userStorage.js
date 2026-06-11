import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentUserId } from "./authStore";

export async function userKey(key) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return `gatecep:guest:${key}`;
  }

  return `gatecep:${userId}:${key}`;
}

export async function userGetItem(key) {
  return AsyncStorage.getItem(await userKey(key));
}

export async function userSetItem(key, value) {
  return AsyncStorage.setItem(await userKey(key), value);
}

export async function userRemoveItem(key) {
  return AsyncStorage.removeItem(await userKey(key));
}