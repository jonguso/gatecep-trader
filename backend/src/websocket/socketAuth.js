import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "gatecep-secret";

export function socketAuth(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Socket authentication required"));
    }

    const user = jwt.verify(token, JWT_SECRET);

    socket.user = user;

    next();
  } catch (error) {
    next(new Error("Invalid socket token"));
  }
}