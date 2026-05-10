import { pool } from "../config/db.js";

export async function savePersistentOrder(order) {
  await pool.query(
    `
    INSERT INTO orders (
      id,
      symbol,
      side,
      quantity,
      price,
      broker,
      status,
      broker_status,
      filled_quantity,
      remaining_quantity,
      average_fill_price,
      fill_percent,
      retry_count,
      max_retries,
      rejection_reason,
      last_broker_attempt,
      created_at,
      updated_at
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      broker_status = EXCLUDED.broker_status,
      filled_quantity = EXCLUDED.filled_quantity,
      remaining_quantity = EXCLUDED.remaining_quantity,
      average_fill_price = EXCLUDED.average_fill_price,
      fill_percent = EXCLUDED.fill_percent,
      retry_count = EXCLUDED.retry_count,
      max_retries = EXCLUDED.max_retries,
      rejection_reason = EXCLUDED.rejection_reason,
      last_broker_attempt = EXCLUDED.last_broker_attempt,
      updated_at = EXCLUDED.updated_at
    `,
    [
      order.id,
      order.symbol,
      order.side,
      order.quantity,
      order.price,
      order.broker,
      order.status,
      order.brokerStatus,
      order.filledQuantity,
      order.remainingQuantity,
      order.averageFillPrice,
      order.fillPercent,
      order.retryCount,
      order.maxRetries,
      order.rejectionReason,
      order.lastBrokerAttempt,
      order.createdAt,
      order.updatedAt
    ]
  );
}

export async function loadPersistentOrders() {
  const result = await pool.query(
    `SELECT * FROM orders ORDER BY created_at DESC`
  );

  return result.rows;
}