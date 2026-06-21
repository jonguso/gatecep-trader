import { pool } from "../config/db.js";

export async function saveParentExecution(parent) {
  await pool.query(
    `
    INSERT INTO parent_executions (
      parent_id, symbol, side, parent_quantity,
      execution_style, status, created_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    ON CONFLICT (parent_id) DO UPDATE SET
      status = EXCLUDED.status,
      execution_style = EXCLUDED.execution_style
    `,
    [
      parent.parentId,
      parent.symbol,
      parent.side,
      parent.quantity,
      parent.executionStyle,
      parent.status,
      parent.createdAt
    ]
  );
}

export async function saveChildOrder(parentId, child, broker) {
  await pool.query(
    `
        INSERT INTO child_orders (
      child_id,
      parent_id,
      quantity,
      status,
      broker,
      created_at
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (child_id) DO UPDATE SET
      status = EXCLUDED.status,
      broker = EXCLUDED.broker
    `,
    [
      child.childId,
      parentId,
      child.quantity,
      child.status,
      broker,
      child.createdAt
    ]
  );
}

export async function saveExecutionFill(fill) {
  await pool.query(
    `
    INSERT INTO execution_fills (
      fill_id,
      order_id,
      symbol,
      quantity,
      price,
      broker,
      created_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    ON CONFLICT (fill_id) DO NOTHING
    `,
    [
      fill.fillId,
      fill.orderId,
      fill.symbol,
      fill.quantity,
      fill.price,
      fill.broker,
      fill.createdAt
    ]
  );
}
 