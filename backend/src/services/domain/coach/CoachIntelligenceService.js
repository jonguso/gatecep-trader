// backend/src/services/domain/coach/CoachIntelligenceService.js

function priorityRank(priority) {
  const ranks = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  return ranks[priority] || 0;
}

function buildInsight({
  type,
  priority,
  title,
  insight,
  action,
  confidence = 80,
  severity = "MODERATE",
  explanation = ""
}) {
  return {
    type,
    priority,
    severity,
    confidence,
    title,
    insight,
    explanation,
    action
  };
}

function buildNextBestActions(recommendations = []) {
  return recommendations.map((item) => {
    const actionMap = {
      LINK_BROKER: {
        label: "Connect Broker",
        route: "/brokers",
        style: "primary"
      },
      REBALANCE_PORTFOLIO: {
        label: "Rebalance Portfolio",
        route: "/portfolio",
        style: "warning"
      },
      REVIEW_POSITION_SIZE: {
        label: "Review Position",
        route: "/portfolio",
        style: "warning"
      },
      DIVERSIFY_SECTOR: {
        label: "Diversify Sector",
        route: "/portfolio/analytics",
        style: "warning"
      },
      REVIEW_SECTOR_ALLOCATION: {
        label: "Review Allocation",
        route: "/portfolio/analytics",
        style: "warning"
      },
      INCREASE_CASH_BUFFER: {
        label: "Increase Cash Buffer",
        route: "/cash",
        style: "secondary"
      },
      REVIEW_OPPORTUNITIES: {
        label: "Review Opportunities",
        route: "/coach",
        style: "primary"
      },
      MONITOR_AND_REBALANCE: {
        label: "Monitor & Rebalance",
        route: "/coach",
        style: "secondary"
      },
      CONTINUE_MONITORING: {
        label: "Continue Monitoring",
        route: "/dashboard",
        style: "secondary"
      }
    };

    const config = actionMap[item.action] || {
      label: "Review",
      route: "/coach",
      style: "secondary"
    };

    return {
      action: item.action,
      label: config.label,
      route: config.route,
      style: config.style,
      priority: item.priority,
      severity: item.severity,
      confidence: item.confidence
    };
  });
}

function buildCoachNarrative({ healthStatus, primaryInsight, nextBestActions = [] }) {
  const firstAction = nextBestActions[0];

  if (!primaryInsight) {
    return "Coach G reviewed your portfolio and did not find any major issues right now.";
  }

  return `Coach G sees your portfolio as ${healthStatus.label}. ${primaryInsight.insight} ${primaryInsight.explanation} Recommended next step: ${firstAction?.label || "Review your portfolio"}.`;
}

function buildHealthStatus(primaryInsight, recommendations = []) {
  const highCount = recommendations.filter((r) => r.priority === "HIGH").length;
  const mediumCount = recommendations.filter((r) => r.priority === "MEDIUM").length;

  let status = "HEALTHY";
  let label = "Healthy";
  let summary = "Portfolio looks stable.";
  let tone = "positive";

  if (highCount > 0) {
    status = "NEEDS_ATTENTION";
    label = "Needs Attention";
    summary = primaryInsight?.insight || "Coach G found high-priority portfolio risks.";
    tone = "warning";
  } else if (mediumCount > 0) {
    status = "WATCH";
    label = "Watch";
    summary = primaryInsight?.insight || "Coach G found items worth monitoring.";
    tone = "caution";
  }

  return {
    status,
    label,
    tone,
    summary,
    mainRisk: primaryInsight?.title || null,
    confidence: primaryInsight?.confidence || 0
  };
}

export function generateIntelligentRecommendations({
  portfolio,
  performance,
  cashData,
  brokers = []
}) {
  const recommendations = [];

  const totalValue = Number(portfolio?.totalValue || 0);
  const investedValue = Number(portfolio?.investedValue || 0);
  const gainPct = Number(portfolio?.gainPct || 0);

  const totalCash = Number(cashData?.summary?.totalCash || 0);
  const netWorth = totalValue + totalCash;

  const largestSector = performance?.allocation?.[0] || null;

  const largestHolding =
    [...(performance?.holdings || [])].sort((a, b) => b.value - a.value)[0] ||
    null;

  const cashWeight =
    netWorth > 0 ? Number(((totalCash / netWorth) * 100).toFixed(2)) : 0;

  if (!brokers.length) {
    recommendations.push(
      buildInsight({
        type: "BROKER_CONNECTION",
        priority: "HIGH",
        severity: "HIGH",
        confidence: 95,
        title: "Connect a broker",
        insight:
          "Gatecep can provide better recommendations once your broker account is linked.",
        explanation:
          "Broker connectivity improves portfolio accuracy, trade routing, cash visibility, and future settlement tracking.",
        action: "LINK_BROKER"
      })
    );
  }

  if (largestHolding?.weight > 50) {
    recommendations.push(
      buildInsight({
        type: "HOLDING_CONCENTRATION",
        priority: "HIGH",
        severity: "HIGH",
        confidence: 92,
        title: "High single-stock concentration",
        insight: `${largestHolding.symbol} represents ${largestHolding.weight}% of your portfolio.`,
        explanation:
          "A single holding above 50% can expose the portfolio to large swings if that stock declines.",
        action: "REBALANCE_PORTFOLIO"
      })
    );
  } else if (largestHolding?.weight > 30) {
    recommendations.push(
      buildInsight({
        type: "HOLDING_CONCENTRATION",
        priority: "MEDIUM",
        severity: "MODERATE",
        confidence: 88,
        title: "Single-stock concentration risk",
        insight: `${largestHolding.symbol} represents ${largestHolding.weight}% of your portfolio.`,
        explanation:
          "A position above 30% may reduce diversification and increase portfolio volatility.",
        action: "REVIEW_POSITION_SIZE"
      })
    );
  }

  if (largestSector?.weight > 70) {
    recommendations.push(
      buildInsight({
        type: "SECTOR_CONCENTRATION",
        priority: "HIGH",
        severity: "HIGH",
        confidence: 90,
        title: "Heavy sector concentration",
        insight: `${largestSector.sector} represents ${largestSector.weight}% of your portfolio.`,
        explanation:
          "A sector above 70% means portfolio performance is highly dependent on one part of the market.",
        action: "DIVERSIFY_SECTOR"
      })
    );
  } else if (largestSector?.weight > 50) {
    recommendations.push(
      buildInsight({
        type: "SECTOR_CONCENTRATION",
        priority: "MEDIUM",
        severity: "MODERATE",
        confidence: 86,
        title: "Sector concentration risk",
        insight: `${largestSector.sector} represents ${largestSector.weight}% of your portfolio.`,
        explanation:
          "Sector concentration above 50% can reduce portfolio balance across the market.",
        action: "REVIEW_SECTOR_ALLOCATION"
      })
    );
  }

  if (cashWeight < 5 && netWorth > 0) {
    recommendations.push(
      buildInsight({
        type: "LOW_CASH_BUFFER",
        priority: "MEDIUM",
        severity: "MODERATE",
        confidence: 82,
        title: "Low cash buffer",
        insight: `Cash is only ${cashWeight}% of net worth.`,
        explanation:
          "A low cash buffer may reduce flexibility for opportunities, fees, withdrawals, or emergencies.",
        action: "INCREASE_CASH_BUFFER"
      })
    );
  }

  if (cashWeight > 20) {
    recommendations.push(
      buildInsight({
        type: "EXCESS_CASH",
        priority: "LOW",
        severity: "LOW",
        confidence: 78,
        title: "Cash available for deployment",
        insight: `Cash is ${cashWeight}% of net worth.`,
        explanation:
          "A higher cash position may be useful for safety, but it may also reduce long-term growth if left idle.",
        action: "REVIEW_OPPORTUNITIES"
      })
    );
  }

  if (investedValue > 0 && gainPct > 5) {
    recommendations.push(
      buildInsight({
        type: "POSITIVE_MOMENTUM",
        priority: "LOW",
        severity: "LOW",
        confidence: 74,
        title: "Portfolio has positive momentum",
        insight: `Your unrealized gain is ${gainPct}%.`,
        explanation:
          "Positive performance is useful, but Coach G still checks diversification before recommending aggressive action.",
        action: "MONITOR_AND_REBALANCE"
      })
    );
  }

  if (!recommendations.length) {
    recommendations.push(
      buildInsight({
        type: "PORTFOLIO_OK",
        priority: "LOW",
        severity: "LOW",
        confidence: 75,
        title: "Portfolio looks stable",
        insight: "No major concentration, cash, or broker issues detected.",
        explanation:
          "Coach G did not detect any immediate risk signal from the current portfolio data.",
        action: "CONTINUE_MONITORING"
      })
    );
  }

  const sortedRecommendations = recommendations.sort(
  (a, b) => priorityRank(b.priority) - priorityRank(a.priority)
);

const primaryInsight = sortedRecommendations[0] || null;
const nextBestActions = buildNextBestActions(sortedRecommendations).slice(0, 3);
const healthStatus = buildHealthStatus(primaryInsight, sortedRecommendations);

return {
  recommendations: sortedRecommendations,
  primaryInsight,
  nextBestActions,
  healthStatus,
  coachNarrative: buildCoachNarrative({
    healthStatus,
    primaryInsight,
    nextBestActions
  }),
  intelligenceVersion: "CoachG-011E"
};
}