import { getPortfolioSummary } from "../portfolio/PortfolioService.js";
import { calculatePortfolioPerformance } from "../performance/PerformanceService.js";
import { getCashSummary } from "../../../modules/cash/cash.service.js";
import { generateIntelligentRecommendations } from "../coach/CoachIntelligenceService.js";
import { createEvent } from "./EventRegistry.js";
import { prepareNotifications } from "./NotificationService.js";
import { EventTypes } from "./EventTypes.js";

export async function processPortfolioEvents(userId) {
  const [portfolio, cashData] = await Promise.all([
    getPortfolioSummary(userId),
    getCashSummary(userId)
  ]);

  const performance = calculatePortfolioPerformance(portfolio.holdings || []);

  const intelligence = generateIntelligentRecommendations({
    portfolio,
    performance,
    cashData,
    brokers: []
  });

  const events = [];

  intelligence.recommendations.forEach((item) => {
    if (item.type === "HOLDING_CONCENTRATION") {
      events.push(
        createEvent({
          type: EventTypes.PORTFOLIO_CONCENTRATION,
          userId,
          severity: item.severity,
          title: item.title,
          message: item.insight,
          source: "CoachG",
          metadata: item
        })
      );
    }

    if (item.type === "SECTOR_CONCENTRATION") {
      events.push(
        createEvent({
          type: EventTypes.SECTOR_CONCENTRATION,
          userId,
          severity: item.severity,
          title: item.title,
          message: item.insight,
          source: "CoachG",
          metadata: item
        })
      );
    }

    if (item.type === "LOW_CASH_BUFFER") {
      events.push(
        createEvent({
          type: EventTypes.CASH_LOW,
          userId,
          severity: item.severity,
          title: item.title,
          message: item.insight,
          source: "CoachG",
          metadata: item
        })
      );
    }

    if (item.type === "EXCESS_CASH") {
      events.push(
        createEvent({
          type: EventTypes.CASH_HIGH,
          userId,
          severity: item.severity,
          title: item.title,
          message: item.insight,
          source: "CoachG",
          metadata: item
        })
      );
    }
  });

  const notifications = prepareNotifications(events);

  return {
  userId,
  events,
  eventEngineVersion: "EventEngine-012C"
};
}