import {
  findUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} from "./notifications.repository.js";

function buildSummary(notifications = []) {
  return {
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    high: notifications.filter((n) => n.severity === "HIGH").length,
    medium: notifications.filter((n) => n.severity === "MEDIUM").length,
    low: notifications.filter((n) => n.severity === "LOW").length
  };
}

export async function getNotifications(userId) {
  const notifications = await findUserNotifications(userId);

  return {
    ok: true,
    summary: buildSummary(notifications),
    notifications,
    notificationServiceVersion: "NotificationService-012D"
  };
}

export async function readNotification(userId, notificationId) {
  const notification = await markNotificationRead(userId, notificationId);

  return {
    ok: true,
    notification
  };
}

export async function readAllNotifications(userId) {
  const notifications = await markAllNotificationsRead(userId);

  return {
    ok: true,
    updatedCount: notifications.length,
    notifications
  };
}

export async function removeNotification(userId, notificationId) {
  const result = await deleteNotification(userId, notificationId);

  return {
    ok: true,
    result
  };
}