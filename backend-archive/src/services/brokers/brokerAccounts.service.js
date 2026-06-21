import {
  saveBrokerAccount,
  loadBrokerAccounts
} from "../../repositories/brokerAccounting.repository.js";

let brokerAccounts = [
  {
    broker: "ABC",
    accountNumber: "ABC-001",
    cashBalance: 250000,
    portfolioValue: 540000,
    buyingPower: 210000,
    connected: true,
    preferred: true
  },
  {
    broker: "AIB",
    accountNumber: "AIB-889",
    cashBalance: 180000,
    portfolioValue: 320000,
    buyingPower: 150000,
    connected: true,
    preferred: false
  },
  {
    broker: "NCBA",
    accountNumber: "NCBA-443",
    cashBalance: 95000,
    portfolioValue: 205000,
    buyingPower: 87000,
    connected: true,
    preferred: false
  }
];

async function persistAccounts() {
  for (const account of brokerAccounts) {
    await saveBrokerAccount(account);
  }
}

(async () => {
  const saved = await loadBrokerAccounts();

  if (saved.length > 0) {
    brokerAccounts = saved;
  } else {
    await persistAccounts();
  }
})();

export function getBrokerAccounts() {
  return brokerAccounts;
}

export function setPreferredBroker(broker) {
  brokerAccounts.forEach((account) => {
    account.preferred =
      account.broker === broker;
  });

persistAccounts();

  return brokerAccounts;
}

export function getPreferredBroker() {
  const preferred = brokerAccounts.find((account) => account.preferred);

  return preferred?.broker || "ABC";
}

export function getBrokerAccount(broker) {
  return brokerAccounts.find((account) => account.broker === broker);
}

export function debitBrokerBuyingPower(broker, amount) {
  const account = getBrokerAccount(broker);

  if (!account) {
    
persistAccounts();
	return {
      ok: false,
      error: "BROKER_ACCOUNT_NOT_FOUND"
    };
  }

  if (account.buyingPower < amount) {
    return {
      ok: false,
      error: "INSUFFICIENT_BROKER_BUYING_POWER",
      account
    };
  }

  account.buyingPower = Number((account.buyingPower - amount).toFixed(2));
  account.cashBalance = Number((account.cashBalance - amount).toFixed(2));

  return {
    ok: true,
    account
  };
}

export function creditBrokerBuyingPower(broker, amount) {
  const account = getBrokerAccount(broker);

  if (!account) {
    
persistAccounts();
	return {
      ok: false,
      error: "BROKER_ACCOUNT_NOT_FOUND"
    };
  }

  account.buyingPower = Number((account.buyingPower + amount).toFixed(2));
  account.cashBalance = Number((account.cashBalance + amount).toFixed(2));

  return {
    ok: true,
    account
  };
}