import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

import { login } from "./routes/auth.js";
import { getUsers, getAccount, getPortfolio } from "./routes/accounts.js";
import { getBrokers, getMyBrokerLinks, linkBroker, selectBroker } from "./routes/brokers.js";
import {
  getOnboardingSteps,
  startOnboarding,
  getOnboarding,
  updatePersonalDetails,
  updateCdsDetails,
  addDocument,
  updateRiskProfile,
  acceptTerms,
  submitForReview,
  approveOnboarding
} from "./routes/onboarding.js";
import { handleOrder, getOrders, getAudit } from "./routes/orders.js";
import { handlePreview } from "./routes/preview.js";
import { getSecurities, getPrices, getSummary, getCandles } from "./routes/market.js";
import { getRecommendation, handleChat } from "./routes/ai.js";
import { startMarketFeed } from "./ws/market.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "GATECEP Clean Backend running" }));

app.post("/auth/login", login);

app.get("/brokers", getBrokers);
app.get("/brokers/links", getMyBrokerLinks);
app.post("/brokers/link", linkBroker);
app.post("/brokers/select", selectBroker);

app.get("/onboarding/steps", getOnboardingSteps);
app.post("/onboarding/start", startOnboarding);
app.get("/onboarding", getOnboarding);
app.post("/onboarding/personal", updatePersonalDetails);
app.post("/onboarding/cds", updateCdsDetails);
app.post("/onboarding/document", addDocument);
app.post("/onboarding/risk", updateRiskProfile);
app.post("/onboarding/terms", acceptTerms);
app.post("/onboarding/submit", submitForReview);
app.post("/onboarding/approve", approveOnboarding);

app.get("/users", getUsers);
app.get("/account/:userId", getAccount);
app.get("/portfolio/:userId", getPortfolio);

app.get("/securities", getSecurities);
app.get("/prices", getPrices);
app.get("/market/summary", getSummary);
app.get("/candles/:symbol", getCandles);

app.post("/order", handleOrder);
app.get("/orders", getOrders);
app.get("/audit", getAudit);
app.post("/preview", handlePreview);

app.get("/recommendation/:symbol/:userId", getRecommendation);
app.post("/ai/chat", handleChat);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

global.clients = [];
wss.on("connection", ws => {
  global.clients.push(ws);
  ws.on("close", () => { global.clients = global.clients.filter(c => c !== ws); });
});

startMarketFeed();

server.listen(port, () => console.log(`GATECEP Clean Backend running on http://localhost:${port}`));
