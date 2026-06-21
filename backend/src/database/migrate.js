import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { query } from "./db.js";

dotenv.config();

const dir = path.resolve("src/database/migrations");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  const sql = fs.readFileSync(path.join(dir, file), "utf8");
  console.log(`Running migration ${file}`);
  await query(sql);
}

console.log("Migrations complete");
process.exit(0);
