import {
  addWalletLedgerEntry
} from "./walletLedger.service.js";

let wallet = {
  balance: 0,
  currency: "KES",
  deposits: []
};

export function getWalletBalance() {
  return wallet;
}

export function depositFunds(amount) {
  const value = Number(amount || 0);

  if (value <= 0) {
    return {
      ok: false,
      error: "INVALID_DEPOSIT_AMOUNT"
    };
  }

  const deposit = {
    id: `DEP-${Date.now()}`,
    amount: value,
    currency: "KES",
    source: "DEMO_DEPOSIT",
    createdAt: new Date().toISOString()
  };

  wallet.balance += value;

addWalletLedgerEntry({
  type: "DEPOSIT",
  amount,
  currency: wallet.currency,
  balanceAfter: wallet.balance,
  description: "Demo wallet deposit"
});

  wallet.deposits.unshift(deposit);

  return {
    ok: true,
    wallet,
    deposit
  };
}

export function debitWallet(amount) {
  const value = Number(amount || 0);

  if (value <= 0) {
    return {
      ok: false,
      error: "INVALID_DEBIT_AMOUNT"
    };
  }

  if (value > wallet.balance) {
    return {
      ok: false,
      error: "INSUFFICIENT_WALLET_BALANCE"
    };
  }

  wallet.balance -= value;

addWalletLedgerEntry({
  type: "DEBIT",
  amount,
  currency: wallet.currency,
  balanceAfter: wallet.balance,
  description: "BUY order wallet debit"
});


  return {
    ok: true,
    wallet
  };
}
export function creditWallet(amount, description = "SELL order wallet credit") {
  const value = Number(amount || 0);

  if (value <= 0) {
    return {
      ok: false,
      error: "INVALID_CREDIT_AMOUNT"
    };
  }

  wallet.balance += value;

  addWalletLedgerEntry({
    type: "CREDIT",
    amount: value,
    currency: wallet.currency,
    balanceAfter: wallet.balance,
    description
  });

  return {
    ok: true,
    wallet
  };
}