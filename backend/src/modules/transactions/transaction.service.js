import {
  createTransaction,
  listTransactions
} from "./transaction.repository.js";

export async function recordTransaction(userId, payload = {}) {
  const type = String(payload.transactionType || payload.type || "").toUpperCase();

  const grossAmount =
    Number(payload.grossAmount || 0) ||
    Number(payload.quantity || 0) * Number(payload.price || 0);

  const fees = Number(payload.fees || 0);
  const tax = Number(payload.tax || 0);

  let netAmount = Number(payload.netAmount || 0);

  if (!netAmount) {
    if (type === "BUY") netAmount = -(grossAmount + fees + tax);
    else if (type === "SELL") netAmount = grossAmount - fees - tax;
    else netAmount = Number(payload.amount || grossAmount || 0);
  }

  return await createTransaction(userId, {
    ...payload,
    transactionType: type || "UNKNOWN",
    grossAmount,
    fees,
    tax,
    netAmount
  });
}

export async function getTransactions(userId, options = {}) {
  const transactions = await listTransactions(userId, options);

  return {
    ok: true,
    count: transactions.length,
    transactions,
    version: "TransactionEngine-017B"
  };
}