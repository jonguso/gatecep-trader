export function buildInvestorProfile(input = {}) {
  const goal = String(input.goal || "balanced_growth");
  const risk = String(input.risk || "balanced");
  const experience = String(input.experience || "beginner");
  const timeHorizon = String(input.timeHorizon || "3_5_years");
  const contribution = String(input.contribution || "flexible");

  let sectorCap = 30;
  let cashReserve = 15;
  let maxSinglePosition = 10;
  let minimumHoldings = 5;

  if (risk === "conservative") {
    sectorCap = 25;
    cashReserve = 20;
    maxSinglePosition = 8;
    minimumHoldings = 6;
  }

  if (risk === "aggressive") {
    sectorCap = 40;
    cashReserve = 8;
    maxSinglePosition = 15;
  }

  if (goal === "dividend") {
    cashReserve += 3;
    sectorCap = Math.min(sectorCap, 30);
  }

  if (goal === "preservation" || timeHorizon === "under_1_year") {
    cashReserve = Math.max(cashReserve, 25);
    maxSinglePosition = Math.min(maxSinglePosition, 7);
  }

  return {
    profileVersion: "COACH_G_PROFILE_V1",
    goal,
    risk,
    experience,
    timeHorizon,
    contribution,
    investorType: getInvestorType(goal, risk),
    constraints: { sectorCap, cashReserve, maxSinglePosition, minimumHoldings },
    alignmentRules: {
      compareUploadedPortfolio: true,
      flagGoalMismatch: true,
      flagSectorConcentration: true,
      flagCashMismatch: true,
      flagBehaviorMismatch: true
    }
  };
}

function getInvestorType(goal, risk) {
  if (goal === "dividend") return "Income Builder";
  if (goal === "retirement") return "Long-Term Builder";
  if (goal === "preservation") return "Capital Protector";
  if (risk === "aggressive") return "Growth Seeker";
  return "Balanced Builder";
}
