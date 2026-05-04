export const BROKERS = [
  {
    id: "aib-axys",
    name: "AIB-AXYS Africa",
    country: "Kenya",
    status: "PARTNER_PENDING",
    supportsApiTrading: false,
    supportsPortfolioSync: false,
    accountLinkingMode: "MANUAL_VERIFICATION",
    fees: { commissionBps: 210, minFee: 100 },
    notes: "Adapter placeholder. Enable after signed API partnership."
  },
  {
    id: "dyer-blair",
    name: "Dyer & Blair Investment Bank",
    country: "Kenya",
    status: "PARTNER_PENDING",
    supportsApiTrading: false,
    supportsPortfolioSync: false,
    accountLinkingMode: "MANUAL_VERIFICATION",
    fees: { commissionBps: 210, minFee: 100 },
    notes: "Adapter placeholder. Enable after signed API partnership."
  },
  {
    id: "faida",
    name: "Faida Investment Bank",
    country: "Kenya",
    status: "PARTNER_PENDING",
    supportsApiTrading: false,
    supportsPortfolioSync: false,
    accountLinkingMode: "MANUAL_VERIFICATION",
    fees: { commissionBps: 210, minFee: 100 },
    notes: "Adapter placeholder. Enable after signed API partnership."
  },
  {
    id: "ncba-invest",
    name: "NCBA Investment Bank",
    country: "Kenya",
    status: "PARTNER_PENDING",
    supportsApiTrading: false,
    supportsPortfolioSync: false,
    accountLinkingMode: "MANUAL_VERIFICATION",
    fees: { commissionBps: 210, minFee: 100 },
    notes: "Adapter placeholder. Enable after signed API partnership."
  },
  {
    id: "mock-broker",
    name: "GATECEP Mock Broker",
    country: "Kenya",
    status: "ACTIVE_DEMO",
    supportsApiTrading: true,
    supportsPortfolioSync: true,
    accountLinkingMode: "INSTANT_DEMO",
    fees: { commissionBps: 200, minFee: 50 },
    notes: "Demo broker used for testing only."
  }
];

export function getBroker(brokerId) {
  return BROKERS.find(b => b.id === brokerId);
}
