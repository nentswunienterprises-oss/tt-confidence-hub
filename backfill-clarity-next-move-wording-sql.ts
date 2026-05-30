import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL || "";

if (!databaseUrl) {
  console.error("❌ Missing DATABASE_URL");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

const PHRASE_UPDATES = [
  {
    old: "Reinforce recognition and first-step decisions before increasing difficulty.",
    replacement: "Reinforce recognition and first-step decisions before introducing independent problem-solving.",
  },
];

async function backfillClarityNextMoves() {
  const client = await pool.connect();
  try {
    console.log("🔍 Searching for reports with legacy Clarity next-move wording...");

    const oldPatterns = PHRASE_UPDATES.map((item) => `%${item.old}%`);
    const result = await client.query(
      `SELECT id, next_steps, summary FROM parent_reports WHERE ${PHRASE_UPDATES
        .map((_, index) => `next_steps ILIKE $${index + 1}`)
        .join(" OR ")}`,
      oldPatterns
    );

    if (!result.rows || result.rows.length === 0) {
      console.log("✅ No reports found with old wording - all up to date!");
      process.exit(0);
    }

    console.log(`📋 Found ${result.rows.length} report(s) to update`);

    let updated = 0;
    let errors = 0;

    for (const row of result.rows) {
      try {
        let updatedNextSteps = row.next_steps || "";
        let updatedSummary = row.summary;

        for (const { old, replacement } of PHRASE_UPDATES) {
          if (updatedNextSteps.includes(old)) {
            updatedNextSteps = updatedNextSteps.replaceAll(old, replacement);
          }

          if (row.summary && row.summary.includes(old)) {
            try {
              const summaryObj = typeof row.summary === "string"
                ? JSON.parse(row.summary)
                : row.summary;

              if (summaryObj.nextMove) {
                if (Array.isArray(summaryObj.nextMove)) {
                  summaryObj.nextMove = summaryObj.nextMove.map((move: string) =>
                    move.replaceAll(old, replacement)
                  );
                } else if (typeof summaryObj.nextMove === "string") {
                  summaryObj.nextMove = summaryObj.nextMove.replaceAll(old, replacement);
                }
              }
              updatedSummary = JSON.stringify(summaryObj);
            } catch (parseError) {
              console.warn(`⚠️  Could not parse summary JSON for ${row.id}, skipping summary update`);
            }
          }
        }

        await client.query(
          `UPDATE parent_reports SET next_steps = $1, summary = $2 WHERE id = $3`,
          [updatedNextSteps, updatedSummary, row.id]
        );

        console.log(`✅ Updated report ${row.id}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error processing report ${row.id}:`, error);
        errors++;
      }
    }

    console.log(
      `\n📊 Backfill complete: ${updated} updated, ${errors} errors`
    );
    process.exit(errors > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Backfill failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

backfillClarityNextMoves();
