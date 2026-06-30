export function generateWealthBlueprint(dna = {}) {
  const risk = dna.riskProfile || "BALANCED";

  const allocations = {
    CONSERVATIVE: { equity: 45, cash: 35, income: 20 },
    BALANCED: { equity: 60, cash: 20, income: 20 },
    GROWTH: { equity: 75, cash: 15, income: 10 },
    AGGRESSIVE: { equity: 85, cash: 10, income: 5 }
  };

  return {
    title: "Your Wealth Blueprint",
    goal: dna.goal,
    investorType: dna.investorType,
    riskProfile: risk,
    strategy: dna.recommendedStrategy,
    allocation: allocations[risk] || allocations.BALANCED,
    coachGMessage:
      "This blueprint is designed to help you practice investing with confidence before connecting a real broker."
  };
}