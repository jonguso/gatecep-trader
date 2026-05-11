import { io } from "socket.io-client";

import { API_URL } from "../../config/api";

let socket = null;

export function connectSocket(token) {
  if (socket) {
    return socket;
  }

  socket = io(API_URL, {
    transports: ["websocket"],
    auth: {
      token
    }
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("connect_error", (error) => {
    console.log("Socket auth error:", error.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}