import { pool } from "../../database/db.js";

function mapEventRow(row) {
  return {
    id: row.id,
    type: row.type,
    userId: row.userId,
    severity: row.severity,
    title: row.title,
    message: row.message,
    source: row.source,
    metadata: row.metadata || {},
    acknowledged: row.acknowledged,
    acknowledgedAt: row.acknowledgedAt,
    createdAt: row.createdAt
  };
}

export async function saveEvents(events = []) {
  if (!events.length) return [];

  const saved = [];

  for (const event of events) {
    const result = await pool.query(
      `
        INSERT INTO user_events (
          id,
          user_id,
          type,
          severity,
          title,
          message,
          source,
          metadata,
          acknowledged,
          created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO NOTHING
        RETURNING
          id,
          user_id AS "userId",
          type,
          severity,
          title,
          message,
          source,
          metadata,
          acknowledged,
          acknowledged_at AS "acknowledgedAt",
          created_at AS "createdAt"
      `,
      [
        event.id,
        event.userId,
        event.type,
        event.severity || "LOW",
        event.title,
        event.message,
        event.source || "Gatecep",
        event.metadata || {},
        event.acknowledged || false,
        event.createdAt || new Date().toISOString()
      ]
    );

    if (result.rows[0]) {
      saved.push(mapEventRow(result.rows[0]));
    }
  }

  return saved;
}

export async function findUserEvents(userId) {
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
        acknowledged,
        acknowledged_at AS "acknowledgedAt",
        created_at AS "createdAt"
      FROM user_events
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 100
    `,
    [userId]
  );

  return result.rows.map(mapEventRow);
}

export async function acknowledgeEvent(userId, eventId) {
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
        acknowledged,
        acknowledged_at AS "acknowledgedAt",
        created_at AS "createdAt"
    `,
    [eventId, userId]
  );

  if (!result.rows[0]) {
    throw new Error("Event not found");
  }

  return mapEventRow(result.rows[0]);
}