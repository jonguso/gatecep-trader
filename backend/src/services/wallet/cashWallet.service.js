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

  return {
    ok: true,
    wallet
  };
}