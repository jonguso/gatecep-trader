import "dotenv/config";
import express from "express";
import cors from "cors";
import { state } from "./store/state.js";
import { marketDataGateway } from "./services/marketData/MarketDataGateway.js";
import { placeOrder, listOrders } from "./routes/orders.js";
import { getTradeRecommendation } from "./routes/recommendations.js";
import { getLedger, getBalances, clearPendingOrders } from "./routes/accounting.js";
import { authRouter } from "./routes/authRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);

app.get("/", (req, res) => res.json({ ok: true, app: "gatecep-backend" }));
app.get("/prices", async (req, res) => res.json(await marketDataGateway.getPrices()));
app.get("/account/:userId", (req, res) => res.json(state.users[req.params.userId]));
app.get("/portfolio/:userId", (req, res) => res.json(state.holdings[req.params.userId] || []));
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
    gainers: rows.filter(x => x.changePct > 0).sort((a,b)=>b.changePct-a.changePct).slice(0,10),
    losers: rows.filter(x => x.changePct < 0).sort((a,b)=>a.changePct-b.changePct).slice(0,5),
    movers: [...rows].sort((a,b)=>b.turnover-a.turnover).slice(0,5)
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Gatecep backend running on ${port}`));
