export const PORTFOLIO_TABS = [
  "Holdings",
  "Allocation",
  "Performance",
  "Income",
  "Transactions"
];

export function buildPortfolioHub(portfolio = []) {
  const holdings = Array.isArray(portfolio) ? portfolio : [];

  const totalValue = holdings.reduce(
    (sum, item) => sum + Number(item.marketValue || item.value || 0),
    0
  );

  const investedValue = holdings.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.averagePrice || item.averageCost || item.costPrice || 0),
    0
  );

  const gainLoss = totalValue - investedValue;
  const gainLossPct = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0;

  const sectors = {};

  holdings.forEach((holding) => {
    const sector = holding.sector || "Other";
    const value = Number(holding.marketValue || holding.value || 0);

    sectors[sector] = (sectors[sector] || 0) + value;
  });

  const allocation = Object.entries(sectors)
    .map(([sector, value]) => ({
      sector,
      value,
      pct: totalValue > 0 ? (value / totalValue) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);

  const largestSector = allocation[0] || null;

  const diversification =
    allocation.length >= 5
      ? "Good"
      : allocation.length >= 3
      ? "Moderate"
      : "Concentrated";

  const incomeStocks = holdings
    .map((item) => {
      const value = Number(item.marketValue || item.value || 0);
      const estimatedAnnualIncome = value * 0.06;

      return {
        symbol: item.symbol || "N/A",
        name: item.name || item.symbol || "Security",
        estimatedAnnualIncome
      };
    })
    .sort((a, b) => b.estimatedAnnualIncome - a.estimatedAnnualIncome)
    .slice(0, 5);

  return {
    totalValue,
    investedValue,
    gainLoss,
    gainLossPct,
    holdingsCount: holdings.length,
    allocation,
    largestSector,
    diversification,
    performance: {
      oneDay: 1.2,
      oneWeek: 3.8,
      oneMonth: 6.4,
      ytd: 14.7
    },
    income: {
      annual: totalValue * 0.06,
      monthly: (totalValue * 0.06) / 12,
      incomeStocks
    },
    transactions: [
      {
        id: "TXN-001",
        type: "BUY",
        symbol: "SCOM",
        quantity: 100,
        price: 31.75,
        status: "FILLED"
      },
      {
        id: "TXN-002",
        type: "BUY",
        symbol: "KCB",
        quantity: 50,
        price: 70.75,
        status: "FILLED"
      },
      {
        id: "TXN-003",
        type: "BUY",
        symbol: "EABL",
        quantity: 20,
        price: 258.25,
        status: "FILLED"
      }
    ]
  };
}