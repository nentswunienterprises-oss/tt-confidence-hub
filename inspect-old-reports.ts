import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function inspect() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, next_steps FROM parent_reports WHERE next_steps ILIKE $1 LIMIT 10`,
      ["%increasing difficulty%"]
    );
    console.log(`Found ${result.rows.length} reports with old wording:`);
    result.rows.forEach((row: any) => {
      console.log(`- ID: ${row.id}`);
      console.log(`  next_steps: ${row.next_steps}`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}

inspect();
