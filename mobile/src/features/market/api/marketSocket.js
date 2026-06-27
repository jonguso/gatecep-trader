import { io } from "socket.io-client";
import { API_URL } from "../../../config/apiConfig";

let socket = null;

export function getMarketSocket(userId) {
  if (socket) return socket;

  const socketUrl = API_URL.replace(/\/api$/, "");

  socket = io(socketUrl, {
    transports: ["websocket"],
    auth: {
      userId
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000
  });

  return socket;
}

export function closeMarketSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}