import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function useNotificationSocket() {
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);
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

    socket.on("notification:new", (payload) => {
      const notification =
        payload?.notification || payload;

      setLatestNotification(notification);

      setNotifications((current) => [
        notification,
        ...current
      ]);

      setLastUpdate(new Date().toISOString());
    });

    socket.on("notifications:update", (payload) => {
      const rows =
        payload?.notifications ||
        payload ||
        [];

      setNotifications(rows);
      setLastUpdate(new Date().toISOString());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    notifications,
    latestNotification,
    connected,
    lastUpdate
  };
}