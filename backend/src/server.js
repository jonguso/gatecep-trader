import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

import { login } from "./routes/auth.js";
import { getUsers, getAccount, getPortfolio } from "./routes/accounts.js";
import { getBrokers, getMyBrokerLinks, linkBroker, selectBroker } from "./routes/brokers.js";
import { handleOrder, getOrders, getAudit } from "./routes/orders.js";
import { handlePreview } from "./routes/preview.js";
import { getSecurities, getPrices, getSummary } from "./routes/market.js";
import { getRecommendation, handleChat } from "./routes/ai.js";
import { getCandles } from "./routes/candles.js";
import { startMarketFeed } from "./ws/market.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "GATECEP Multi-Broker Backend running" }));

app.post("/auth/login", login);

app.get("/brokers", getBrokers);
app.get("/brokers/links", getMyBrokerLinks);
app.post("/brokers/link", linkBroker);
app.post("/brokers/select", selectBroker);

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

server.listen(port, () => console.log(`GATECEP Multi-Broker Backend running on http://localhost:${port}`));
