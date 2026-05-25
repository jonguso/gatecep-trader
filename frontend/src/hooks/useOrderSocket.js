import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function useOrderSocket() {
  const [orders, setOrders] = useState([]);
  const [latestOrder, setLatestOrder] = useState(null);
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

    socket.on("order:update", (payload) => {
      const order = payload?.order || payload;

      setLatestOrder(order);

      setOrders((current) => {
        const exists = current.some(
          (item) => item.id === order.id
        );

        if (exists) {
          return current.map((item) =>
            item.id === order.id ? order : item
          );
        }

        return [order, ...current];
      });

      setLastUpdate(new Date().toISOString());
    });

    socket.on("orders:update", (payload) => {
      const rows =
        payload?.orders ||
        payload?.queue ||
        payload ||
        [];

      setOrders(rows);
      setLastUpdate(new Date().toISOString());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    orders,
    latestOrder,
    connected,
    lastUpdate
  };
}