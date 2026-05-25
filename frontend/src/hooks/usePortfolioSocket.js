import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function usePortfolioSocket() {
  const [portfolio, setPortfolio] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const socket = io(API_URL, {
      transports: ["websocket"]
    });

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("portfolio:update", (payload) => {
      setPortfolio(payload?.portfolio || payload);
      setLastUpdate(new Date().toISOString());
    });

    socket.on("portfolio", (payload) => {
      setPortfolio(payload?.portfolio || payload);
      setLastUpdate(new Date().toISOString());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    portfolio,
    connected,
    lastUpdate
  };
}