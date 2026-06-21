import {
  loadWallet,
  saveWallet
} from "../../repositories/wallet.repository.js";

export function getWalletBalance() {
  const wallet = loadWallet();

  return {
    ...wallet,
    balance:
      Number(wallet.ledgerBalance || 0) -
      Number(wallet.pendingOrders || 0) -
      Number(wallet.pendingSettlement || 0)
  };
}

export function debitWallet(amount, note = "Wallet debit") {
  const value = Number(amount || 0);
  const wallet = getWalletBalance();

  if (value <= 0) {
    return {
      ok: false,
      error: "INVALID_AMOUNT"
    };
  }

  if (value > Number(wallet.balance || 0)) {
    return {
      ok: false,
      error: "INSUFFICIENT_WALLET_BALANCE"
    };
  }

  const updated = saveWallet({
    ...wallet,
    pendingOrders:
      Number(wallet.pendingOrders || 0) + value,
    lastTransaction: {
      type: "DEBIT",
      amount: value,
      note,
      createdAt: new Date().toISOString()
    }
  });

  return {
    ok: true,
    wallet: getWalletBalance(),
    updated
  };
}

export function creditWallet(amount, note = "Wallet credit") {
  const value = Number(amount || 0);
  const wallet = loadWallet();

  if (value <= 0) {
    return {
      ok: false,
      error: "INVALID_AMOUNT"
    };
  }

  const updated = saveWallet({
    ...wallet,
    ledgerBalance:
      Number(wallet.ledgerBalance || 0) + value,
    lastTransaction: {
      type: "CREDIT",
      amount: value,
      note,
      createdAt: new Date().toISOString()
    }
  });

 return {
  ok: true,
  wallet: getWalletBalance(),
  updated
};
}

export function releasePendingOrder(amount, note = "Release pending order") {
  const value = Number(amount || 0);
  const wallet = loadWallet();

  const updated = saveWallet({
    ...wallet,
    pendingOrders: Math.max(
      0,
      Number(wallet.pendingOrders || 0) - value
    ),
    lastTransaction: {
      type: "RELEASE_PENDING",
      amount: value,
      note,
      createdAt: new Date().toISOString()
    }
  });

  return {
    ok: true,
    wallet: getWalletBalance(),
    updated
  };
}

export function settlePendingOrder(amount, note = "Order settlement") {
  const value = Number(amount || 0);
  const wallet = loadWallet();

  const updated = saveWallet({
    ...wallet,
    ledgerBalance:
      Number(wallet.ledgerBalance || 0) - value,
    pendingOrders: Math.max(
      0,
      Number(wallet.pendingOrders || 0) - value
    ),
    lastTransaction: {
      type: "SETTLEMENT",
      amount: value,
      note,
      createdAt: new Date().toISOString()
    }
  });

  return {
    ok: true,
    wallet: getWalletBalance(),
    updated
  };
}

export function depositFunds(amount, note = "Funds deposit") {
  return creditWallet(amount, note);
}

export function withdrawFunds(amount, note = "Funds withdrawal") {
  const value = Number(amount || 0);
  const wallet = getWalletBalance();

  if (value <= 0) {
    return {
      ok: false,
      error: "INVALID_AMOUNT"
    };
  }

  if (value > Number(wallet.balance || 0)) {
    return {
      ok: false,
      error: "INSUFFICIENT_FUNDS"
    };
  }

  const updated = saveWallet({
    ...wallet,
    ledgerBalance:
      Number(wallet.ledgerBalance || 0) - value,
    lastTransaction: {
      type: "WITHDRAWAL",
      amount: value,
      note,
      createdAt: new Date().toISOString()
    }
  });

 return {
  ok: true,
  wallet: getWalletBalance(),
  updated
};
}
