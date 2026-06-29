export const BROKERS = [
  {
    id: "gatecep-demo",
    code: "GATECEP-DEMO",
    name: "GateCEP Demo",
    bestFor: "Paper trading, portfolio import, and AI coaching",
    type: "demo",
    supportsTrading: true,
    supportsImport: true,
    recommended: true
  },
  {
    id: "aib-axys",
    code: "AIB-AXYS",
    name: "AIB-AXYS",
    bestFor: "Long-term investors and dividend portfolios",
    type: "broker",
    supportsTrading: true,
    supportsImport: true
  },
  {
    id: "abc-capital",
    code: "ABC",
    name: "ABC Capital",
    bestFor: "Active investors and execution support",
    type: "broker",
    supportsTrading: true,
    supportsImport: true
  },
  {
    id: "ncba-investment-bank",
    code: "NCBA",
    name: "NCBA Investment Bank",
    bestFor: "Bank-integrated investing",
    type: "broker",
    supportsTrading: true,
    supportsImport: true
  },
  {
    id: "dyer-blair",
    code: "DYER-BLAIR",
    name: "Dyer & Blair",
    bestFor: "Research-driven investors",
    type: "broker",
    supportsTrading: true,
    supportsImport: true
  },
  {
    id: "standard-investment-bank",
    code: "SIB",
    name: "Standard Investment Bank",
    bestFor: "Banking and brokerage convenience",
    type: "broker",
    supportsTrading: true,
    supportsImport: true
  },
  {
    id: "genghis-capital",
    code: "GENGHIS",
    name: "Genghis Capital",
    bestFor: "Digital-first investors",
    type: "broker",
    supportsTrading: true,
    supportsImport: true
  },
  {
    id: "faida-investment-bank",
    code: "FAIDA",
    name: "Faida Investment Bank",
    bestFor: "NSE retail investors",
    type: "broker",
    supportsTrading: true,
    supportsImport: true
  },
  {
    id: "other",
    code: "OTHER",
    name: "Other",
    bestFor: "Link an unsupported broker account",
    type: "other",
    supportsTrading: false,
    supportsImport: true
  }
];

export function getBrokerByCode(code) {
  return BROKERS.find(
    (broker) => broker.code === code || broker.name === code
  );
}

export function getDefaultBroker() {
  return BROKERS[0];
}