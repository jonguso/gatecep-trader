import {
  generateCoachGAlerts
} from "../services/ai/coachGAlerts.service.js";

export function initCoachGSocket(io) {
  setInterval(async () => {
    const alerts =
      await generateCoachGAlerts();

    io.emit("coachg:alerts", alerts);

  }, 15000);
}