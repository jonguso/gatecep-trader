import { pool } from "../config/db.js";

export async function findUserByUsername(username) {
  const result = await pool.query(
    `SELECT * FROM users WHERE username = $1 LIMIT 1`,
    [username]
  );

  return result.rows[0] || null;
}

export async function createUser({ username, passwordHash, role }) {
  const result = await pool.query(
    `
    INSERT INTO users (username, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING id, username, role
    `,
    [username, passwordHash, role]
  );

  return result.rows[0];
}

export async function countUsers() {
  const result = await pool.query(`SELECT COUNT(*) FROM users`);
  return Number(result.rows[0].count);
}