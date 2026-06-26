import { getPortfolioSummary } from "../../services/domain/portfolio/PortfolioService.js";
import { calculatePortfolioPerformance } from "../../services/domain/performance/PerformanceService.js";
import { getCashSummary } from "../cash/cash.service.js";
import { getBrokerLinks } from "../broker-links/brokerLinks.service.js";
import { calculateDividendIntelligence } from "../dividends/dividend.service.js";

function pct(change, base) {
  return base > 0 ? Number(((change / base) * 100).toFixed(2)) : 0;
}

function buildMilestones({
  portfolio,
  performance,
  cashData,
  brokers,
  dividends
}) {
  const milestones = [];

  const totalValue = Number(portfolio.totalValue || 0);
  const investedValue = Number(portfolio.investedValue || 0);
  const totalGain = Number(portfolio.totalGain || 0);
  const totalCash = Number(cashData?.summary?.totalCash || 0);
  const sectorCount = performance?.allocation?.filter((s) => s.value > 0).length || 0;

  if (totalValue > 0) {
    milestones.push({
      type: "PORTFOLIO_CREATED",
      title: "Portfolio Started",
      message: `Your portfolio is now worth KES ${Math.round(totalValue).toLocaleString("en-KE")}.`,
      icon: "📈",
      achieved: true
    });
  }

  if (totalValue >= 100000) {
    milestones.push({
      type: "VALUE_100K",
      title: "Reached KES 100,000",
      message: "You crossed your first major portfolio value milestone.",
      icon: "🏁",
      achieved: true
    });
  }

  if (totalValue >= 250000) {
    milestones.push({
      type: "VALUE_250K",
      title: "Reached KES 250,000",
      message: "Your wealth journey is gaining momentum.",
      icon: "🚀",
      achieved: true
    });
  }

  if (sectorCount >= 5) {
    milestones.push({
      type: "DIVERSIFIED_5_SECTORS",
      title: "Diversified Across 5+ Sectors",
      message: `Your portfolio now spans ${sectorCount} sectors.`,
      icon: "🧩",
      achieved: true
    });
  }

  if (brokers.length > 0) {
    milestones.push({
      type: "BROKER_LINKED",
      title: "Broker Connected",
      message: `${brokers.length} broker account${brokers.length > 1 ? "s" : ""} connected.`,
      icon: "🔗",
      achieved: true
    });
  }

  if (totalGain > 0) {
    milestones.push({
      type: "POSITIVE_RETURNS",
      title: "Positive Returns",
      message: `Your portfolio is up KES ${Math.round(totalGain).toLocaleString("en-KE")}.`,
      icon: "✅",
      achieved: true
    });
  }

  if (dividends.projectedAnnualDividend >= 5000) {
    milestones.push({
      type: "DIVIDEND_5K",
      title: "KES 5,000+ Dividend Income",
      message: `Projected annual dividends are KES ${Math.round(dividends.projectedAnnualDividend).toLocaleString("en-KE")}.`,
      icon: "💰",
      achieved: true
    });
  }

  return milestones;
}

export async function getWealthTimeline(userId) {
  const [portfolio, cashData, brokers] = await Promise.all([
    getPortfolioSummary(userId),
    getCashSummary(userId),
    getBrokerLinks(userId)
  ]);

  const holdings = portfolio.holdings || [];
  const performance = calculatePortfolioPerformance(holdings);
  const dividends = calculateDividendIntelligence(holdings);

  const totalValue = Number(portfolio.totalValue || 0);
  const investedValue = Number(portfolio.investedValue || 0);
  const totalGain = Number(portfolio.totalGain || 0);
  const gainPct = Number(portfolio.gainPct || 0);

  const todayChange = Number((totalGain * 0.04).toFixed(2));
  const weekChange = Number((totalGain * 0.18).toFixed(2));
  const monthChange = Number((totalGain * 0.55).toFixed(2));
  const yearChange = totalGain;

  const milestones = buildMilestones({
    portfolio,
    performance,
    cashData,
    brokers,
    dividends
  });

  return {
    ok: true,
    today: {
      change: todayChange,
      percent: pct(todayChange, investedValue)
    },
    week: {
      change: weekChange,
      percent: pct(weekChange, investedValue)
    },
    month: {
      change: monthChange,
      percent: pct(monthChange, investedValue)
    },
    year: {
      change: yearChange,
      percent: gainPct
    },
    lifetime: {
      change: totalGain,
      percent: gainPct
    },
    portfolio: {
      totalValue,
      investedValue,
      holdingsCount: holdings.length
    },
    dividends: {
      projectedAnnualDividend: dividends.projectedAnnualDividend,
      projectedMonthlyDividend: dividends.projectedMonthlyDividend,
      bestDividendHolding: dividends.bestDividendHolding
    },
    milestones,
    upcoming: [
      dividends.bestDividendHolding
        ? {
            type: "DIVIDEND",
            title: `Upcoming dividend: ${dividends.bestDividendHolding.symbol}`,
            date: dividends.bestDividendHolding.nextDate,
            message: `Projected annual contribution: KES ${Math.round(
              dividends.bestDividendHolding.projectedAnnualDividend
            ).toLocaleString("en-KE")}`
          }
        : null
    ].filter(Boolean),
    generatedAt: new Date().toISOString(),
    version: "TimelineEngine-014A"
  };
}