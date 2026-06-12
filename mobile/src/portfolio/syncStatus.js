import { userGetItem, userSetItem } from "../auth/userStorage";
import { loadPortfolio } from "./portfolioStore";

export async function buildSyncStatus() {
  const holdings = await loadPortfolio({ revalue: true });

  const cashRaw = await userGetItem("availableCash");
  const brokerRaw = await userGetItem("brokerProfile");
  const txRaw = await userGetItem("transactionHistory");

  const portfolioUploaded = await userGetItem("statementUploaded");
  const cashUploaded = await userGetItem("cashStatementUploaded");
  const transactionsUploaded = await userGetItem("transactionsUploaded");

  const statementSummaryRaw = await userGetItem("statementSummary");
  const txSummaryRaw = await userGetItem("transactionUploadSummary");

  const broker = brokerRaw ? JSON.parse(brokerRaw) : null;
  const transactions = txRaw ? JSON.parse(txRaw) : [];
  const statementSummary = statementSummaryRaw
    ? JSON.parse(statementSummaryRaw)
    : null;
  const txSummary = txSummaryRaw ? JSON.parse(txSummaryRaw) : null;

  const status = {
    broker: broker?.broker || broker?.name || "No broker",
    brokerConnected: !!broker,
    holdingsCount: holdings.length,
    availableCash: Number(cashRaw || 0),
    transactionCount: transactions.length,
    portfolioValue: holdings.reduce(
      (sum, h) => sum + Number(h.marketValue || h.value || 0),
      0
    ),
    portfolioUploaded: portfolioUploaded === "true",
    cashUploaded: cashUploaded === "true",
    transactionsUploaded: transactionsUploaded === "true",
    lastPortfolioSync: statementSummary?.uploadedAt || null,
    lastCashSync: statementSummary?.uploadedAt || null,
    lastTransactionSync: txSummary?.uploadedAt || null,
    updatedAt: new Date().toISOString()
  };

  await userSetItem("syncStatus", JSON.stringify(status));

  return status;
}

export async function getSyncStatus() {
  const raw = await userGetItem("syncStatus");

  if (raw) {
    return JSON.parse(raw);
  }

  return await buildSyncStatus();
}