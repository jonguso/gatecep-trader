import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export async function getSecureItem(key) {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

export async function setSecureItem(key, value) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }

  return SecureStore.setItemAsync(key, value);
}

export async function deleteSecureItem(key) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }

  return SecureStore.deleteItemAsync(key);
}