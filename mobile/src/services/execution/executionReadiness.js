import { userGetItem } from "../auth/userStorage";
import { loadUnifiedPortfolio } from "../portfolio/unifiedPortfolioApi";
import { loadTradeBasket } from "../trade/tradeBasketStore";
import { loadBrokerAccounts } from "../brokers/brokerAccountStore";

export async function calculateExecutionReadiness() {
  const accounts = await loadBrokerAccounts();
  const basket = await loadTradeBasket();
  const portfolioData = await loadUnifiedPortfolio();
  const portfolio = portfolioData?.holdings || [];

  const cashRaw = await userGetItem("availableCash");
  const profileRaw = await userGetItem("investorProfile");

  const cash = Number(cashRaw || 0);
  const profile = profileRaw ? JSON.parse(profileRaw) : null;

  const defaultBroker =
    accounts.find((a) => a.defaultBroker) ||
    accounts[0] ||
    null;

  const checks = {
  investorProfile: !!profile,
  brokerLinked: !!defaultBroker,
  clientNumberPresent: !!defaultBroker?.clientNumber,
  basketExists: (basket?.items?.length || 0) > 0,
  cashAvailable: cash > 0,
  holdingsLoaded: portfolio.length > 0
};

  const totalChecks = Object.keys(checks).length;

  const passedChecks =
    Object.values(checks).filter(Boolean).length;

  const readinessScore = Math.round(
    (passedChecks / totalChecks) * 100
  );

  return {
    score: readinessScore,

    status:
      readinessScore >= 90
        ? "READY"
        : readinessScore >= 70
        ? "ALMOST_READY"
        : "SETUP_REQUIRED",

    checks,

    broker: defaultBroker?.brokerName || null,
    cdsNumber: defaultBroker?.cdsNumber || null,
    clientNumber: defaultBroker?.clientNumber || null,

    holdingsCount: portfolio.length,
    basketCount: basket?.items?.length || 0,
    availableCash: cash,

    calculatedAt: new Date().toISOString()
  };
}