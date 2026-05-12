import { getUnifiedPortfolio } from "../services/portfolio/unifiedPortfolio.service.js";

export function initPortfolioSocket(io) {
  io.on("connection", (socket) => {
    console.log("Portfolio socket connected");

    const sendPortfolio = async () => {
      try {
        const portfolio =
          await getUnifiedPortfolio();

        socket.emit(
          "portfolio:update",
          portfolio
        );
      } catch (error) {
        socket.emit("portfolio:error", {
          error: error.message
        });
      }
    };

    sendPortfolio();

    const interval = setInterval(
      sendPortfolio,
      5000
    );

    socket.on("disconnect", () => {
      clearInterval(interval);
    });
  });
}