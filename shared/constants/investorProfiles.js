export const INVESTOR_PROFILES = {
  dividend: {
    key: "dividend",
    label: "Income Builder",
    description: "Prioritizes dividend income and stable cash flow."
  },

  retirement: {
    key: "retirement",
    label: "Long-Term Builder",
    description: "Builds wealth gradually for long-term retirement goals."
  },

  purchase: {
    key: "purchase",
    label: "Goal Saver",
    description: "Preserves capital for a specific future purchase."
  },

  balanced_growth: {
    key: "balanced_growth",
    label: "Balanced Builder",
    description: "Balances growth, income, and moderate risk."
  },

  wealth_growth: {
    key: "wealth_growth",
    label: "Growth Seeker",
    description: "Prioritizes capital growth over short-term income."
  }
};

export function getInvestorProfile(goal) {
  const key = String(goal || "balanced_growth").trim();

  return INVESTOR_PROFILES[key] || INVESTOR_PROFILES.balanced_growth;
}