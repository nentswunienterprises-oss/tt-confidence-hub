import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const client = await pool.connect();
  try {
    const clarityResult = await client.query(
      `SELECT id, next_steps, summary FROM parent_reports WHERE next_steps = $1 OR summary ILIKE $2 LIMIT 20`,
      [
        "Reinforce recognition and first-step decisions before increasing difficulty.",
        "%Reinforce recognition and first-step decisions before increasing difficulty.%",
      ]
    );
    console.log("Reports with OLD Clarity wording:", clarityResult.rows.length);
    clarityResult.rows.forEach((r: any) => console.log("- ID:", r.id));

    const structuredResult = await client.query(
      `SELECT id, next_steps, summary FROM parent_reports WHERE next_steps = $1 OR summary ILIKE $2 LIMIT 20`,
      [
        "Reinforce step order and independent starts before increasing difficulty.",
        "%Reinforce step order and independent starts before increasing difficulty.%",
      ]
    );
    console.log("Reports with OLD Structured Execution wording:", structuredResult.rows.length);
    structuredResult.rows.forEach((r: any) => console.log("- ID:", r.id));

    const newResult = await client.query(
      `SELECT id, next_steps, summary FROM parent_reports WHERE next_steps ILIKE $1 OR summary ILIKE $1 LIMIT 20`,
      [`%independent problem-solving%`]
    );
    console.log("\nReports with NEW wording:", newResult.rows.length);
    newResult.rows.forEach((r: any) => console.log("- ID:", r.id));
  } finally {
    client.release();
    await pool.end();
  }
}

check();
