import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id, next_steps FROM parent_reports WHERE id = $1",
      ["27c1d27c-2b75-4594-b45a-20c8cb2859b3"]
    );
    if (result.rows[0]) {
      console.log("Report ID:", result.rows[0].id);
      console.log("next_steps content:");
      console.log(result.rows[0].next_steps);
    } else {
      console.log("Report not found");
    }
  } finally {
    client.release();
    await pool.end();
  }
}

check();
