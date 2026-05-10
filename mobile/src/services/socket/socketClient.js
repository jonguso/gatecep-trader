import { io } from "socket.io-client";
import { API_URL } from "../../config/api";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_URL, {
      transports: ["websocket"]
    });

    socket.on("connect", () => {
      console.log("Mobile socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.log("Mobile socket error:", error.message);
    });

    socket.on("disconnect", () => {
      console.log("Mobile socket disconnected");
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}