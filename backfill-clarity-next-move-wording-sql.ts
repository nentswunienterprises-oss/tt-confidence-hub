import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL || "";

if (!databaseUrl) {
  console.error("❌ Missing DATABASE_URL");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

const OLD_WORDING = "reinforce recognition and first-step decisions before increasing difficulty.";
const NEW_WORDING = "reinforce recognition and first-step decisions before introducing independent problem-solving.";

async function backfillClarityNextMoves() {
  const client = await pool.connect();
  try {
    console.log("🔍 Searching for reports with old Clarity next move wording...");

    // Find all reports with the old wording
    const result = await client.query(
      `SELECT id, next_steps, summary FROM parent_reports WHERE next_steps ILIKE $1`,
      [`%${OLD_WORDING}%`]
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
        // Replace old wording with new wording in next_steps
        const updatedNextSteps = (row.next_steps || "").replaceAll(
          OLD_WORDING,
          NEW_WORDING
        );

        // Also update the summary JSON if it contains the old wording
        let updatedSummary = row.summary;
        if (row.summary && row.summary.includes(OLD_WORDING)) {
          try {
            const summaryObj = typeof row.summary === "string"
              ? JSON.parse(row.summary)
              : row.summary;

            if (summaryObj.nextMove) {
              if (Array.isArray(summaryObj.nextMove)) {
                summaryObj.nextMove = summaryObj.nextMove.map((move: string) =>
                  move.replaceAll(OLD_WORDING, NEW_WORDING)
                );
              } else if (typeof summaryObj.nextMove === "string") {
                summaryObj.nextMove = summaryObj.nextMove.replaceAll(
                  OLD_WORDING,
                  NEW_WORDING
                );
              }
            }
            updatedSummary = JSON.stringify(summaryObj);
          } catch (parseError) {
            console.warn(`⚠️  Could not parse summary JSON for ${row.id}, skipping summary update`);
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
