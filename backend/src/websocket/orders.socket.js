let ioInstance = null;

export function initOrderSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("Order socket connected:", socket.id);
  });
}

export function emitOrderUpdate(order) {
  if (!ioInstance) return;

  ioInstance.emit("order:update", order);
}