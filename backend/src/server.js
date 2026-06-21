import "dotenv/config";

import express from "express";
import cors from "cors";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { Server } from "socket.io";

import { logger } from "./utils/logger.js";
import { state } from "./store/state.js";
import { validateEnv } from "./config/validateEnv.js";

import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { marketDataGateway } from "./services/marketData/MarketDataGateway.js";
import { initDb } from "./database/initDb.js";
import { initializePositions } from "./services/positions/position.service.js";
import { seedDefaultAdmin } from "./services/auth/auth.service.js";

import {
  getLedger,
  getBalances,
  clearPendingOrders
} from "./routes/accounting.js";

import {
  placeOrder,
  listOrders
} from "./routes/orders.js";

import {
  getTradeRecommendation
} from "./routes/recommendations.js";

import {
  getCandles
} from "./routes/candles.js";

import {
  getDividendAIScores
} from "./services/dividends/dividendAI.service.js";

import {
  generateAITradeAlert,
  generateDividendAlert,
  generatePortfolioRiskAlert,
  generateExecutionAlert,
  initNotificationSocket
} from "./services/notifications/notificationEngine.service.js";

/* Core routes */
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
import aiRouter from "./routes/ai.routes.js";
import walletRouter from "./routes/wallet.routes.js";
import walletLedgerRouter from "./routes/walletLedger.routes.js";
import notificationsRouter from "./routes/notifications.routes.js";
import systemResetRoutes from "./routes/systemReset.routes.js";

/* Market / trading routes */
import ordersRouter from "./routes/orders.routes.js";
import orderBookRouter from "./routes/orderBook.routes.js";
import orderBookDepthRoutes from "./routes/orderBookDepth.routes.js";
import orderHistoryRouter from "./routes/orderHistory.routes.js";
import executionRouter from "./routes/execution.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import smartRoutingRouter from "./routes/smartRouting.routes.js";
import executionAdvisorRouter from "./routes/executionAdvisor.routes.js";
import executionQualityRouter from "./routes/executionQuality.routes.js";
import orderSplitterRouter from "./routes/orderSplitter.routes.js";
import childOrdersRouter from "./routes/childOrders.routes.js";
import matchingRouter from "./routes/matching.routes.js";
import timeSalesRouter from "./routes/timeSales.routes.js";
import fixRouter from "./routes/fix.routes.js";

/* Portfolio routes */
import portfolioRouter from "./routes/portfolio.routes.js";
import unifiedPortfolioRouter from "./routes/unifiedPortfolio.routes.js";
import portfolioAnalyticsRoutes from "./routes/portfolioAnalytics.routes.js";
import sectorAllocationRouter from "./routes/sectorAllocation.routes.js";
import riskAnalysisRouter from "./routes/riskAnalysis.routes.js";
import portfolioHeatmapRouter from "./routes/portfolioHeatmap.routes.js";
import portfolioScoreRouter from "./routes/portfolioScore.routes.js";
import portfolioAnalyticsRouter from "./routes/performance.routes.js";
import positionsRouter from "./routes/positions.routes.js";
import pnlRouter from "./routes/pnl.routes.js";
import rebalancerRouter from "./routes/rebalancer.routes.js";
import aiRebalanceRouter from "./routes/aiRebalance.routes.js";
import portfolioImportRouter from "./routes/portfolioImport.routes.js";

/* Broker / Coach G routes */
import { brokerRouter } from "./routes/brokerRoutes.js";
import smartBrokerRouter from "./routes/smartBroker.routes.js";
import brokerHealthRouter from "./routes/brokerHealth.routes.js";
import brokerAccountsRouter from "./routes/brokerAccounts.routes.js";
import brokerCashRouter from "./routes/brokerCash.routes.js";
import brokerReportImportRouter from "./routes/brokerReportImport.routes.js";
import BrokerLinkRouter from "./routes/BrokerLinkRouter.js";

import coachRouter from "./routes/coach.routes.js";
import coachGRouter from "./routes/coachG.routes.js";
import coachGAlertsRouter from "./routes/coachGAlerts.routes.js";
import coachGBrokerMirrorRouter from "./routes/coachGBrokerMirror.routes.js";

import brokerPortfolioRouter from "./routes/brokerPortfolio.routes.js";
import brokerMirrorRebalanceRouter from "./routes/brokerMirrorRebalance.routes.js";
import brokerMirrorHeatmapRouter from "./routes/brokerMirrorHeatmap.routes.js";
import brokerExplainRouter from "./routes/brokerExplain.routes.js";
import brokerMirrorActionsRouter from "./routes/brokerMirrorActions.routes.js";
import brokerMirrorScoreRouter from "./routes/brokerMirrorScore.routes.js";
import brokerAccountSummaryRouter from "./routes/brokerAccountSummary.routes.js";
import brokerSettlementRouter from "./routes/brokerSettlement.routes.js";
import brokerCashSummaryRouter from "./routes/brokerCashSummary.routes.js";
import investmentPlannerRouter from "./routes/investmentPlanner.routes.js";

/* New investor routes */
import newInvestorPlanRoutes from "./routes/newInvestorPlan.routes.js";
import starterBasketRoutes from "./routes/starterBasket.routes.js";
import generatePortfolioRoutes from "./routes/generatePortfolio.routes.js";
import goalTrackerRoutes from "./routes/goalTracker.routes.js";
import stressTestRoutes from "./routes/stressTest.routes.js";

/* Other feature routes */
import dividendsRouter from "./routes/dividends.routes.js";
import aiMarketPulseRouter from "./routes/aiMarketPulse.routes.js";
import sectorRotationAIRouter from "./routes/sectorRotationAI.routes.js";
import tradeJournalRouter from "./routes/tradeJournal.routes.js";
import watchlistRouter from "./routes/watchlist.routes.js";
import riskRouter from "./routes/risk.routes.js";
import settlementRouter from "./routes/settlement.routes.js";
import complianceRouter from "./routes/compliance.routes.js";
import omsAlertsRouter from "./routes/omsAlerts.routes.js";
import redisQueueRouter from "./routes/redisQueue.routes.js";
import exportRouter from "./routes/export.routes.js";

/* WebSocket */
import { socketAuth } from "./websocket/socketAuth.js";
import { initializeSocketGateway } from "./websocket/socketGateway.js";
import { initOrderSocket } from "./websocket/orders.socket.js";
import { initMarketDataSocket } from "./websocket/marketData.socket.js";
import { initCoachGSocket } from "./websocket/coachG.socket.js";
import { initPortfolioSocket } from "./websocket/portfolio.socket.js";

validateEnv();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:3000",
  "http://localhost:19006",
  "http://localhost:8081"
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(helmet());
app.use(morgan("combined"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 300 : 5000
  })
);

app.use(requestLogger);

/* Health */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    app: "gatecep-backend"
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    app: "gatecep-backend",
    status: "ONLINE",
    timestamp: new Date().toISOString()
  });
});

/* Market */
app.get("/prices", async (req, res, next) => {
  try {
    res.json(await marketDataGateway.getPrices());
  } catch (error) {
    next(error);
  }
});

app.get("/candles/:symbol", getCandles);

app.get("/market/rankings", async (req, res, next) => {
  try {
    const prices = await marketDataGateway.getPrices();
    const rows = prices.data || [];

    res.json({
      provider: prices.provider,
      gainers: rows
        .filter((x) => Number(x.changePct || 0) > 0)
        .sort((a, b) => Number(b.changePct || 0) - Number(a.changePct || 0))
        .slice(0, 10),
      losers: rows
        .filter((x) => Number(x.changePct || 0) < 0)
        .sort((a, b) => Number(a.changePct || 0) - Number(b.changePct || 0))
        .slice(0, 5),
      movers: [...rows]
        .sort((a, b) => Number(b.turnover || 0) - Number(a.turnover || 0))
        .slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
});

/* Legacy simple endpoints */
app.get("/account/:userId", (req, res) => {
  res.json(state.users[req.params.userId]);
});

app.get("/portfolio/:userId", (req, res) => {
  res.json(state.holdings[req.params.userId] || []);
});

app.get("/orders", listOrders);
app.post("/order", placeOrder);
app.get("/ledger", getLedger);
app.get("/balances/:userId", getBalances);
app.post("/orders/clear-pending", clearPendingOrders);
app.post("/ai/recommendation", getTradeRecommendation);
app.post("/ai/chat", getTradeRecommendation);

/* Core */
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/ai", aiRouter);
app.use("/wallet", walletRouter);
app.use("/wallet/ledger", walletLedgerRouter);
app.use("/notifications", notificationsRouter);
app.use("/system/reset", systemResetRoutes);

/* Trading */
app.use("/orders", ordersRouter);
app.use("/order-book", orderBookRouter);
app.use("/orderbook", orderBookRouter);
app.use("/orderbook-depth", orderBookDepthRoutes);
app.use("/order-history", orderHistoryRouter);
app.use("/execution", executionRouter);
app.use("/execution", analyticsRouter);
app.use("/execution/smart-routing", smartRoutingRouter);
app.use("/execution-advisor", executionAdvisorRouter);
app.use("/execution-quality", executionQualityRouter);
app.use("/order-splitter", orderSplitterRouter);
app.use("/child-orders", childOrdersRouter);
app.use("/matching", matchingRouter);
app.use("/time-sales", timeSalesRouter);
app.use("/fix", fixRouter);

/* Portfolio */
app.get("/portfolio/unified", async (req, res) => {
  try {
    const { getUnifiedPortfolio } = await import(
      "./services/portfolio/unifiedPortfolio.service.js"
    );

    const portfolio = await getUnifiedPortfolio();

    res.set("Cache-Control", "no-store");
    return res.json(portfolio);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});
app.use("/portfolio", unifiedPortfolioRouter);
app.use("/portfolio", portfolioAnalyticsRoutes);
app.use("/portfolio/sectors", sectorAllocationRouter);
app.use("/portfolio/risk", riskAnalysisRouter);
app.use("/portfolio/heatmap", portfolioHeatmapRouter);
app.use("/portfolio-score", portfolioScoreRouter);
app.use("/portfolio-live", portfolioRouter);
app.use("/portfolio-performance", portfolioAnalyticsRouter);
app.use("/positions", positionsRouter);
app.use("/pnl", pnlRouter);
app.use("/rebalancer", rebalancerRouter);
app.use("/ai-rebalance", aiRebalanceRouter);
app.use("/portfolio", portfolioImportRouter);

/* Broker */
app.use("/brokers", brokerRouter);
app.use("/smart-broker", smartBrokerRouter);
app.use("/broker-health", brokerHealthRouter);
app.use("/broker-accounts", brokerAccountsRouter);
app.use("/broker-cash", brokerCashRouter);
app.use("/broker-reports", brokerReportImportRouter);
app.use("/broker-link", BrokerLinkRouter);

/* Coach G Broker Mirror */
app.use("/coach", coachRouter);
app.use("/coach-g", coachGRouter);
app.use("/coach-g-alerts", coachGAlertsRouter);
app.use("/coach-g/broker-mirror", coachGBrokerMirrorRouter);

app.use("/broker-portfolio", brokerPortfolioRouter);
app.use("/broker-mirror-rebalance", brokerMirrorRebalanceRouter);
app.use("/broker-heatmap", brokerMirrorHeatmapRouter);
app.use("/broker-explain", brokerExplainRouter);
app.use("/broker-mirror/action", brokerMirrorActionsRouter);
app.use("/broker-mirror-score", brokerMirrorScoreRouter);
app.use("/broker-account-summary", brokerAccountSummaryRouter);
app.use("/broker-settlement", brokerSettlementRouter);
app.use("/broker-cash-summary", brokerCashSummaryRouter);
app.use("/investment-planner", investmentPlannerRouter);

/* New Investor */
app.use("/new-investor-plan", newInvestorPlanRoutes);
app.use("/starter-basket", starterBasketRoutes);
app.use("/generate-portfolio", generatePortfolioRoutes);
app.use("/goal-tracker", goalTrackerRoutes);
app.use("/stress-test", stressTestRoutes);

/* Other features */
app.use("/dividends", dividendsRouter);
app.use("/ai-market-pulse", aiMarketPulseRouter);
app.use("/sector-rotation-ai", sectorRotationAIRouter);
app.use("/trade-journal", tradeJournalRouter);
app.use("/watchlist", watchlistRouter);
app.use("/risk", riskRouter);
app.use("/settlement-ledger", settlementRouter);
app.use("/compliance", complianceRouter);
app.use("/oms-alerts", omsAlertsRouter);
app.use("/redis-queue", redisQueueRouter);
app.use("/exports", exportRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

initNotificationSocket(io);

io.use(socketAuth);

initializeSocketGateway(io);
initOrderSocket(io);
initMarketDataSocket(io);
initCoachGSocket(io);
initPortfolioSocket(io);

function startDemoAlerts() {
  setInterval(() => {
    const alerts = [
      () =>
        generateAITradeAlert({
          symbol: "SCOM",
          signal: "BUY_ZONE",
          confidence: 91,
          message: "SCOM approaching accumulation support zone."
        }),

      () =>
        generateDividendAlert({
          symbol: "BAT",
          dividend: 45,
          booksClosureDate: "2026-06-10",
          paymentDate: "2026-06-28"
        }),

      () =>
        generatePortfolioRiskAlert({
          symbol: "SCOM",
          exposure: 48,
          sector: "Telecommunications"
        }),

      () =>
        generateExecutionAlert({
          symbol: "KCB",
          orderId: `ORD-${Date.now()}`,
          status: "FILLED",
          broker: "AIB"
        }),

      () => {
        const dividendScores = getDividendAIScores();
        const bestDividend = [...dividendScores].sort(
          (a, b) =>
            Number(b.captureOpportunityScore || 0) -
            Number(a.captureOpportunityScore || 0)
        )[0];

        if (!bestDividend) return;

        generateAITradeAlert({
          symbol: bestDividend.symbol,
          signal: "DIVIDEND_AI",
          confidence: bestDividend.captureOpportunityScore,
          message:
            `Coach G ranks ${bestDividend.symbol} as ${bestDividend.aiRecommendation}. ` +
            `Estimated yield ${bestDividend.estimatedYieldPercent}%, ` +
            `books close on ${bestDividend.booksClosureDate}.`
        });
      }
    ];

    const randomAlert =
      alerts[Math.floor(Math.random() * alerts.length)];

    randomAlert();
  }, 45000);
}

async function bootstrap() {
  try {
    await initDb();
    await initializePositions();
    await seedDefaultAdmin();

    if (process.env.ENABLE_DEMO_ALERTS !== "false") {
      startDemoAlerts();
    }

    server.listen(PORT, () => {
      logger.info(`Gatecep backend running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start Gatecep backend", {
      error: error.message,
      stack: error.stack
    });

    process.exit(1);
  }
}

bootstrap();