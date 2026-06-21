import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "gatecep-secret";

export function socketAuth(socket, next) {
  const token =
    socket.handshake.auth?.token;

  if (
    process.env.NODE_ENV !== "production" &&
    (!token || token === "null" || token === "undefined")
  ) {
    socket.user = {
      id: "dev-user",
      username: "admin",
      role: "ADMIN"
    };

    return next();
  }

  if (!token) {
    return next(
      new Error("Invalid socket token")
    );
  }

  socket.user = {
    id: "socket-user",
    username: "admin",
    role: "ADMIN"
  };

  return next();
}