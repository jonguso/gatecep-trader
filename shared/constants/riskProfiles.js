export const RISK_PROFILES = {
  conservative: {
    key: "conservative",
    label: "Conservative",
    sectorCap: 20,
    cashReserve: 25,
    maxSinglePosition: 5,
    minimumHoldings: 6
  },

  balanced: {
    key: "balanced",
    label: "Balanced",
    sectorCap: 30,
    cashReserve: 15,
    maxSinglePosition: 10,
    minimumHoldings: 5
  },

  aggressive: {
    key: "aggressive",
    label: "Aggressive",
    sectorCap: 40,
    cashReserve: 5,
    maxSinglePosition: 15,
    minimumHoldings: 5
  }
};

export function getRiskProfile(risk) {
  const key = String(risk || "balanced").toLowerCase().trim();

  return RISK_PROFILES[key] || RISK_PROFILES.balanced;
}