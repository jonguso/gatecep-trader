import {
  getDividendCalendar
} from "./dividendCalendar.service.js";

export function getDividendAIScores() {
  const dividends =
    getDividendCalendar();

  return dividends.map((item) => {
    const yieldPercent =
      estimateYield(item);

    const sustainabilityScore =
      calculateSustainability(
        yieldPercent
      );

    const captureScore =
      calculateCaptureOpportunity(
        item.daysToBooksClosure,
        yieldPercent
      );

    const riskLevel =
      calculateRiskLevel(
        sustainabilityScore
      );

    return {
      symbol: item.symbol,
      company: item.company,
      dividend: item.dividend,
      currency: item.currency,

      estimatedYieldPercent:
        yieldPercent,

      sustainabilityScore,

      captureOpportunityScore:
        captureScore,

      riskLevel,

      aiRecommendation:
        generateRecommendation(
          captureScore,
          sustainabilityScore
        ),

      booksClosureDate:
        item.booksClosureDate,

      paymentDate:
        item.paymentDate,

      status: item.status
    };
  });
}

function estimateYield(item) {
  const mockPrices = {
    BAT: 572.65,
    SCOM: 30.2,
    KCB: 66.8
  };

  const marketPrice =
    mockPrices[item.symbol] || 100;

  return Number(
    (
      (Number(item.dividend || 0) /
        marketPrice) *
      100
    ).toFixed(2)
  );
}

function calculateSustainability(
  yieldPercent
) {
  if (yieldPercent >= 8) {
    return 92;
  }

  if (yieldPercent >= 5) {
    return 82;
  }

  if (yieldPercent >= 3) {
    return 70;
  }

  return 58;
}

function calculateCaptureOpportunity(
  daysToBooksClosure,
  yieldPercent
) {
  let score = 50;

  if (daysToBooksClosure <= 30) {
    score += 25;
  }

  if (yieldPercent >= 5) {
    score += 20;
  }

  if (yieldPercent >= 8) {
    score += 10;
  }

  return Math.min(score, 99);
}

function calculateRiskLevel(
  sustainabilityScore
) {
  if (sustainabilityScore >= 85) {
    return "LOW";
  }

  if (sustainabilityScore >= 70) {
    return "MEDIUM";
  }

  return "HIGH";
}

function generateRecommendation(
  captureScore,
  sustainabilityScore
) {
  if (
    captureScore >= 80 &&
    sustainabilityScore >= 80
  ) {
    return "Strong Dividend Candidate";
  }

  if (
    captureScore >= 65
  ) {
    return "Dividend Watch";
  }

  return "Monitor Carefully";
}