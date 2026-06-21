import { WebSocketServer } from "ws";
import { marketDataGateway } from "../services/marketData/MarketDataGateway.js";

export function attachMarketWebSocket(server) {
  const wss = new WebSocketServer({ server, path: "/ws/market" });

  async function broadcastSnapshot() {
    try {
      const payload = await marketDataGateway.getPrices();
      const msg = JSON.stringify({
        type: "MARKET_SNAPSHOT",
        generatedAt: new Date().toISOString(),
        data: payload.data || []
      });

      for (const client of wss.clients) {
        if (client.readyState === 1) client.send(msg);
      }
    } catch (err) {}
  }

  wss.on("connection", async (socket) => {
    socket.send(JSON.stringify({
      type: "CONNECTED",
      message: "Gatecep market stream connected"
    }));
    await broadcastSnapshot();
  });

  setInterval(broadcastSnapshot, 4000);
  return wss;
}
