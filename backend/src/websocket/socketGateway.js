import { subscribeEvent } from "../services/events/eventBus.service.js";

let ioInstance = null;

export function initializeSocketGateway(io) {
  ioInstance = io;

  console.log("Socket gateway initialized.");

  subscribeEvent("order:update", (event) => {
    io.emit("order:update", event.payload);
  });

  subscribeEvent("execution:fill", (event) => {
    io.emit("execution:fill", event.payload);
  });

  subscribeEvent("market:tick", (event) => {
    io.emit("market:tick", event.payload);
  });

  subscribeEvent("notification:new", (event) => {
    io.emit("notification:new", event.payload);
  });

  subscribeEvent("compliance:alert", (event) => {
    io.emit("compliance:alert", event.payload);
  });

  subscribeEvent("portfolio:update", (event) => {
    io.emit("portfolio:update", event.payload);
  });
}

export function getSocketGateway() {
  return ioInstance;
}