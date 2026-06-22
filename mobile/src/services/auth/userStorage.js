import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentUserId } from "./authStore";

export async function userKey(key) {
  const userId = await getCurrentUserId();

  return userId
    ? `gatecep:${userId}:${key}`
    : `gatecep:guest:${key}`;
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

export async function userMergeItem(key, value) {
  return AsyncStorage.mergeItem(
    await userKey(key),
    value
  );
}

export async function userClearNamespace() {
  const userId = await getCurrentUserId();

  if (!userId) return;

  const keys = await AsyncStorage.getAllKeys();

  const userKeys = keys.filter((key) =>
    key.startsWith(`gatecep:${userId}:`)
  );

  if (userKeys.length) {
    await AsyncStorage.multiRemove(userKeys);
  }
}