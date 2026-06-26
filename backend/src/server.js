import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import portfolioRoutes from "./modules/portfolio/portfolio.routes.js";
import cashRoutes from "./modules/cash/cash.routes.js";
import brokerLinksRoutes from "./modules/broker-links/brokerLinks.routes.js";
import performanceRoutes from "./modules/performance/performance.routes.js";
import coachRoutes from "./modules/coach/coach.routes.js";
import eventsRouter from "./modules/events/events.routes.js";
import notificationsRouter from "./modules/notifications/notifications.routes.js";
import intelligenceRouter from "./modules/intelligence/intelligence.routes.js";
import dividendRouter from "./modules/dividends/dividend.routes.js";
import timelineRouter from "./modules/timeline/timeline.routes.js";

import brokerLinkRoutes from "./routes/broker/brokerLink.routes.js";
import brokerReportRoutes from "./routes/broker/brokerReportImport.routes.js";
import brokerPortfolioRoutes from "./routes/broker/brokerPortfolio.routes.js";
import brokerHeatmapRoutes from "./routes/broker/brokerHeatmap.routes.js";

import brokerMirrorScoreRoutes from "./routes/coachg/brokerMirrorScore.routes.js";
import brokerMirrorRebalanceRoutes from "./routes/coachg/brokerMirrorRebalance.routes.js";
import investmentPlannerRoutes from "./routes/coachg/investmentPlanner.routes.js";
import generatePortfolioRoutes from "./routes/coachg/generatePortfolio.routes.js";
import goalTrackerRoutes from "./routes/coachg/goalTracker.routes.js";
import stressTestRoutes from "./routes/coachg/stressTest.routes.js";
import starterBasketRoutes from "./routes/coachg/starterBasket.routes.js";
import newInvestorPlanRoutes from "./routes/coachg/newInvestorPlan.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = String(process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
    credentials: true
  })
);


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({ ok: true, app: "gatecep-backend" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "gatecep-backend" });
});


/*
 * Broker mirror / portfolio routes
 */
app.use("/user-portfolio", portfolioRoutes);
app.use("/user-cash", cashRoutes);
app.use("/user-brokers", brokerLinksRoutes);
app.use("/portfolio-performance", performanceRoutes);
app.use("/coach", coachRoutes);
app.use("/events", eventsRouter);
app.use("/notifications", notificationsRouter);
app.use("/intelligence", intelligenceRouter);
app.use("/dividends", dividendRouter);
app.use("/timeline", timelineRouter);

app.use("/coach-g/broker-link", brokerLinkRoutes);
app.use("/broker-reports", brokerReportRoutes);
app.use("/broker-portfolio", brokerPortfolioRoutes);
app.use("/broker-heatmap", brokerHeatmapRoutes);

/*
 * Coach G / advisory routes
 */
app.use("/broker-mirror-score", brokerMirrorScoreRoutes);
app.use("/broker-mirror-rebalance", brokerMirrorRebalanceRoutes);
app.use("/investment-planner", investmentPlannerRoutes);
app.use("/generate-portfolio", generatePortfolioRoutes);
app.use("/goal-tracker", goalTrackerRoutes);
app.use("/stress-test", stressTestRoutes);
app.use("/starter-basket", starterBasketRoutes);
app.use("/new-investor-plan", newInvestorPlanRoutes);


app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Route not found",
    method: req.method,
    path: req.originalUrl
  });
});

app.use((error, req, res, next) => {
  res.status(500).json({
    ok: false,
    error: error.message
  });
});

app.listen(PORT, () => {
  console.log(`Gatecep backend running on ${PORT}`);
});

