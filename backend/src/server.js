import "dotenv/config";

import express from "express";
import cors from "cors";
import http from "http";

import { Server } from "socket.io";

import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import { logger } from "./utils/logger.js";

import { state } from "./store/state.js";
import { marketDataGateway } from "./services/marketData/MarketDataGateway.js";

import { placeOrder, listOrders } from "./routes/orders.js";
import { getTradeRecommendation } from "./routes/recommendations.js";

import {
  getLedger,
  getBalances,
  clearPendingOrders
} from "./routes/accounting.js";

import { brokerRouter } from "./routes/brokerRoutes.js";

import executionRouter from "./routes/execution.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import smartRoutingRouter from "./routes/smartRouting.routes.js";
import brokerHealthRouter from "./routes/brokerHealth.routes.js";
import omsAlertsRouter from "./routes/omsAlerts.routes.js";
import orderHistoryRouter from "./routes/orderHistory.routes.js";
import riskRouter from "./routes/risk.routes.js";
import orderBookRouter from "./routes/orderBook.routes.js";
import executionAdvisorRouter from "./routes/executionAdvisor.routes.js";
import orderSplitterRouter from "./routes/orderSplitter.routes.js";
import childOrdersRouter from "./routes/childOrders.routes.js";
import portfolioRouter from "./routes/portfolio.routes.js";
import performanceRouter from "./routes/performance.routes.js";
import settlementRouter from "./routes/settlement.routes.js";
import complianceRouter from "./routes/compliance.routes.js";
import adminRouter from "./routes/admin.routes.js";
import authRouter from "./routes/auth.routes.js";
import aiRouter from "./routes/ai.routes.js";
import watchlistRouter from "./routes/watchlist.routes.js";
import brokerAccountsRouter from "./routes/brokerAccounts.routes.js";
import pnlRouter from "./routes/pnl.routes.js";
import redisQueueRouter from "./routes/redisQueue.routes.js";
import fixRouter from "./routes/fix.routes.js";
import exportRouter from "./routes/export.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import rebalancerRouter from "./routes/rebalancer.routes.js";
import positionsRouter from "./routes/positions.routes.js";

import { initOrderSocket } from "./websocket/orders.socket.js";
import { initMarketDataSocket } from "./websocket/marketData.socket.js";
import { initializeSocketGateway } from "./websocket/socketGateway.js";
import { socketAuth } from "./websocket/socketAuth.js";

import { validateEnv } from "./config/validateEnv.js";

import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { seedDefaultAdmin } from "./services/auth/auth.service.js";

import { initDb } from "./db/initDb.js";


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

app.use(express.json());

app.use(helmet());

app.use(morgan("combined"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
  })
);

app.use(requestLogger);

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

app.get("/prices", async (req, res) => {
  res.json(await marketDataGateway.getPrices());
});

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

app.get("/market/rankings", async (req, res) => {
  const prices = await marketDataGateway.getPrices();

  const rows = prices.data;

  res.json({
    provider: prices.provider,

    gainers: rows
      .filter((x) => x.changePct > 0)
      .sort((a, b) => b.changePct - a.changePct)
      .slice(0, 10),

    losers: rows
      .filter((x) => x.changePct < 0)
      .sort((a, b) => a.changePct - b.changePct)
      .slice(0, 5),

    movers: [...rows]
      .sort((a, b) => b.turnover - a.turnover)
      .slice(0, 5)
  });
});

app.use("/brokers", brokerRouter);
app.use("/execution", executionRouter);
app.use("/execution", analyticsRouter);
app.use("/execution/smart-routing", smartRoutingRouter);
app.use("/broker-health", brokerHealthRouter);
app.use("/oms-alerts", omsAlertsRouter);
app.use("/order-history", orderHistoryRouter);
app.use("/risk", riskRouter);
app.use("/order-book", orderBookRouter);
app.use("/execution-advisor", executionAdvisorRouter);
app.use("/order-splitter", orderSplitterRouter);
app.use("/child-orders", childOrdersRouter);
app.use("/portfolio-live", portfolioRouter);
app.use("/portfolio-performance", performanceRouter);
app.use("/settlement-ledger", settlementRouter);
app.use("/compliance", complianceRouter);
app.use("/admin", adminRouter);
app.use("/auth", authRouter);
app.use("/ai", aiRouter);
app.use("/watchlist", watchlistRouter);
app.use("/broker-accounts", brokerAccountsRouter);
app.use("/pnl", pnlRouter);
app.use("/redis-queue", redisQueueRouter);
app.use("/fix", fixRouter);
app.use("/exports", exportRouter);
app.use("/notifications", notificationRouter);
app.use("/rebalancer", rebalancerRouter);
app.use("/positions", positionsRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

io.use(socketAuth);

initializeSocketGateway(io);

initOrderSocket(io);
initMarketDataSocket(io);

await initDb();

await seedDefaultAdmin();

server.listen(PORT, () => {
  logger.info(`Gatecep backend running on port ${PORT}`);
});