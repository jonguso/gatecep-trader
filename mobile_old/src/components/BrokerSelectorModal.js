import { Modal, View, Text, ScrollView, Pressable, StyleSheet, Alert, Linking } from "react-native";
import LinkedBrokerCard from "./LinkedBrokerCard";

export default function BrokerSelectorModal({
  visible,
  onClose,
  brokers = [],
  linkedAccounts = [],
  selectedBrokerId,
  onSelectBroker,
  onLinkBroker
}) {
  function linkedFor(brokerId) {
    return linkedAccounts.find(x => x.brokerId === brokerId);
  }

  const openSignup = async (broker) => {
    if (!broker.signupUrl) {
      Alert.alert("Coming Soon", `${broker.name} sign-up link will be added.`);
      return;
    }

    try {
      await Linking.openURL(broker.signupUrl);
    } catch {
      Alert.alert("Unable to Open", "Could not open broker sign-up link.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>Choose Broker</Text>
          <Text style={styles.subtitle}>
            Select which broker should handle this NSE order.
          </Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {brokers.map((broker) => (
              <View key={broker.id} style={[styles.cardWrap, selectedBrokerId === broker.id && styles.selectedWrap]}>
                <LinkedBrokerCard
                  broker={broker}
                  linked={linkedFor(broker.id)}
                  onLink={() => onLinkBroker?.(broker)}
                  onSignup={() => openSignup(broker)}
                />

                <Pressable
                  onPress={() => {
                    onSelectBroker?.(broker);
                    onClose?.();
                  }}
                  style={[
                    styles.useBtn,
                    selectedBrokerId === broker.id && styles.useBtnSelected
                  ]}
                >
                  <Text style={styles.useText}>
                    {selectedBrokerId === broker.id ? "Selected" : "Use This Broker"}
                  </Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>

          <Pressable onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.72)",
    justifyContent: "center",
    padding: 16
  },
  modal: {
    maxHeight: "88%",
    backgroundColor: "#08111F",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,.28)"
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900"
  },
  subtitle: {
    color: "#94A3B8",
    marginTop: 4,
    marginBottom: 14
  },
  list: {
    maxHeight: 540
  },
  cardWrap: {
    marginBottom: 12
  },
  selectedWrap: {
    borderWidth: 1,
    borderColor: "#22C55E",
    borderRadius: 18,
    padding: 4
  },
  useBtn: {
    backgroundColor: "#0B5CFF",
    minHeight: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -4,
    marginHorizontal: 6
  },
  useBtnSelected: {
    backgroundColor: "#22C55E"
  },
  useText: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  close: {
    borderWidth: 1,
    borderColor: "#38BDF8",
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12
  },
  closeText: {
    color: "#38BDF8",
    fontWeight: "900"
  }
});
