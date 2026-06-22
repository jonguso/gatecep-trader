import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

export const pool = isProduction
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || "gatecep_trader",
      user: process.env.PGUSER || "postgres",
      password: String(process.env.PGPASSWORD || "")
    });

export async function query(text, params = []) {
  return await pool.query(text, params);
}