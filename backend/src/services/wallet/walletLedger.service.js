const walletLedger = [];

export function addWalletLedgerEntry(entry) {
  walletLedger.unshift({
    id: `WL-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`,
    createdAt: new Date().toISOString(),
    ...entry
  });
}

export function getWalletLedger() {
  return walletLedger;
}