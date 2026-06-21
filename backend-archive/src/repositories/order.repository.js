import { pool } from "../config/db.js";

export async function saveOrder(order) {
  await pool.query(
    `
    INSERT INTO orders (
      id, symbol, side, quantity, price, broker, status, broker_status,
      filled_quantity, remaining_quantity, average_fill_price, fill_percent,
      retry_count, max_retries, rejection_reason, last_broker_attempt,
      created_at, updated_at
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,
      $9,$10,$11,$12,
      $13,$14,$15,$16,
      $17,$18
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      broker_status = EXCLUDED.broker_status,
      filled_quantity = EXCLUDED.filled_quantity,
      remaining_quantity = EXCLUDED.remaining_quantity,
      average_fill_price = EXCLUDED.average_fill_price,
      fill_percent = EXCLUDED.fill_percent,
      retry_count = EXCLUDED.retry_count,
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

export async function saveOrderEvent(orderId, event) {
  await pool.query(
    `
    INSERT INTO order_events (order_id, status, message, timestamp)
    VALUES ($1, $2, $3, $4)
    `,
    [orderId, event.status, event.message, event.timestamp]
  );
}

export async function loadOrders() {
  const ordersResult = await pool.query(
    `SELECT * FROM orders ORDER BY created_at DESC LIMIT 100`
  );

  const eventsResult = await pool.query(
    `SELECT * FROM order_events ORDER BY timestamp ASC`
  );

  return ordersResult.rows.map((row) => ({
    id: row.id,
    symbol: row.symbol,
    side: row.side,
    quantity: Number(row.quantity),
    price: Number(row.price),
    broker: row.broker,
    status: row.status,
    brokerStatus: row.broker_status,
    filledQuantity: Number(row.filled_quantity),
    remainingQuantity: Number(row.remaining_quantity),
    averageFillPrice: Number(row.average_fill_price),
    fillPercent: Number(row.fill_percent),
    retryCount: row.retry_count,
    maxRetries: row.max_retries,
    rejectionReason: row.rejection_reason,
    lastBrokerAttempt: row.last_broker_attempt,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    executionEvents: eventsResult.rows
      .filter((e) => e.order_id === row.id)
      .map((e) => ({
        status: e.status,
        message: e.message,
        timestamp: e.timestamp
      }))
  }));
}