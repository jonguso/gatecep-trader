import { pool } from "../../database/db.js";

function mapNotificationRow(row) {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    severity: row.severity,
    title: row.title,
    message: row.message,
    source: row.source,
    metadata: row.metadata || {},
    read: row.read,
    readAt: row.readAt,
    createdAt: row.createdAt
  };
}

export async function findUserNotifications(userId) {
  const result = await pool.query(
    `
      SELECT
        id,
        user_id AS "userId",
        type,
        severity,
        title,
        message,
        source,
        metadata,
        acknowledged AS "read",
        acknowledged_at AS "readAt",
        created_at AS "createdAt"
      FROM user_events
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 100
    `,
    [userId]
  );

  return result.rows.map(mapNotificationRow);
}

export async function markNotificationRead(userId, notificationId) {
  const result = await pool.query(
    `
      UPDATE user_events
      SET
        acknowledged = true,
        acknowledged_at = NOW()
      WHERE id = $1
        AND user_id = $2
      RETURNING
        id,
        user_id AS "userId",
        type,
        severity,
        title,
        message,
        source,
        metadata,
        acknowledged AS "read",
        acknowledged_at AS "readAt",
        created_at AS "createdAt"
    `,
    [notificationId, userId]
  );

  if (!result.rows[0]) {
    throw new Error("Notification not found");
  }

  return mapNotificationRow(result.rows[0]);
}

export async function markAllNotificationsRead(userId) {
  const result = await pool.query(
    `
      UPDATE user_events
      SET
        acknowledged = true,
        acknowledged_at = NOW()
      WHERE user_id = $1
        AND acknowledged = false
      RETURNING
        id,
        user_id AS "userId",
        type,
        severity,
        title,
        message,
        source,
        metadata,
        acknowledged AS "read",
        acknowledged_at AS "readAt",
        created_at AS "createdAt"
    `,
    [userId]
  );

  return result.rows.map(mapNotificationRow);
}

export async function deleteNotification(userId, notificationId) {
  const result = await pool.query(
    `
      DELETE FROM user_events
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [notificationId, userId]
  );

  if (!result.rows[0]) {
    throw new Error("Notification not found");
  }

  return {
    id: notificationId,
    deleted: true
  };
}