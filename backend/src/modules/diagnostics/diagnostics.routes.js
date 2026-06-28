// backend/src/modules/diagnostics/diagnostics.routes.js
import express from "express";
import { pool } from "../../database/db.js";

const router = express.Router();

router.get("/db", async (req, res) => {
  try {
    const db = await pool.query(`
      SELECT current_database() AS database,
             current_schema() AS schema,
             current_user AS user,
             inet_server_addr() AS server_addr,
             inet_server_port() AS server_port
    `);

    const tables = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_name ILIKE '%auth%'
      ORDER BY table_schema, table_name
    `);

    res.json({
      ok: true,
      db: db.rows[0],
      tables: tables.rows
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
      code: error.code || null
    });
  }
});

export default router;