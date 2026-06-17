import { loadBasketExecution } from "./basketExecutionStore";
import { loadPortfolio } from "../portfolio/portfolioStore";
import { userGetItem } from "../auth/userStorage";

export async function loadTradingHubData() {
  const execution = await loadBasketExecution();
  const portfolio = await loadPortfolio({ revalue: false });

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