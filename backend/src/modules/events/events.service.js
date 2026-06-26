import { processPortfolioEvents } from "../../services/domain/events/EventEngine.js";
import { prepareNotifications } from "../../services/domain/events/NotificationService.js";
import {
  saveEvents,
  findUserEvents,
  acknowledgeEvent
} from "./events.repository.js";

export async function generatePortfolioEvents(userId) {
  const result = await processPortfolioEvents(userId);

  const savedEvents = await saveEvents(result.events || []);
  const notifications = prepareNotifications(savedEvents);

  return {
    ok: true,
    userId,
    eventCount: savedEvents.length,
    events: savedEvents,
    notifications,
    eventServiceVersion: "EventService-012C",
    eventEngineVersion: result.eventEngineVersion
  };
}

export async function getUserEvents(userId) {
  const events = await findUserEvents(userId);

  return {
    ok: true,
    userId,
    eventCount: events.length,
    events
  };
}

export async function markEventAcknowledged(userId, eventId) {
  const event = await acknowledgeEvent(userId, eventId);

  return {
    ok: true,
    event
  };
}