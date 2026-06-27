import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

export default function AccountEdit() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Account Edit</Text>
      <Text style={styles.body}>Account editing will be available here.</Text>

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 24,
    justifyContent: "center"
  },
  title: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "900"
  },
  body: {
    color: "#cbd5e1",
    marginTop: 10,
    fontSize: 15
  },
  button: {
    marginTop: 22,
    backgroundColor: "#9333ea",
    borderRadius: 16,
    padding: 14,
    alignItems: "center"
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "900"
  }
});