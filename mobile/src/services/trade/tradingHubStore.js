import { loadBasketExecution } from "./basketExecutionStore";
import { loadUnifiedPortfolio } from "../portfolio/unifiedPortfolioApi";
import { userGetItem } from "../auth/userStorage";

export async function loadTradingHubData() {
  const execution = await loadBasketExecution();
  const portfolioData = await loadUnifiedPortfolio();
  const portfolio = portfolioData?.holdings || [];

  const brokerRaw = await userGetItem("defaultBrokerProfile");
  const cashRaw = await userGetItem("availableCash");

  const broker = brokerRaw ? JSON.parse(brokerRaw) : null;

  const orders =
    execution?.orders?.filter(
      (order) =>
        !["FILLED", "CANCELLED", "FAILED", "REJECTED"].includes(
          String(order.status || "").toUpperCase()
        )
    ) || [];

  return {
    broker,
    cash: Number(cashRaw || 0),
    portfolio,
    orders,
    execution,
    loadedAt: new Date().toISOString()
  };
}