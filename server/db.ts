import { Pool } from "pg";
import * as schema from "../dist/shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Always enforce SSL for Supabase
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Minimal Drizzle compatibility: mimic .execute for debug/test
export const db = {
  async execute(sql: string) {
    const result = await pool.query(sql);
    return result.rows;
  },
  insert: (...args: any[]) => { throw new Error('Use pool.query for inserts in this patch'); },
};
