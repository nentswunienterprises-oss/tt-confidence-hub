import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const OLD_WORDING = "reinforce recognition and first-step decisions before increasing difficulty.";
const NEW_WORDING = "reinforce recognition and first-step decisions before introducing independent problem-solving.";

async function backfillClarityNextMoves() {
  console.log("🔍 Searching for reports with old Clarity next move wording...");

  try {
    // Fetch all reports that contain the old wording in next_steps
    const { data: reports, error: fetchError } = await supabase
      .from("parent_reports")
      .select("id, next_steps, summary")
      .ilike("next_steps", `%${OLD_WORDING}%`);

    if (fetchError) {
      console.error("❌ Error fetching reports:", fetchError);
      process.exit(1);
    }

    if (!reports || reports.length === 0) {
      console.log("✅ No reports found with old wording - all up to date!");
      process.exit(0);
    }

    console.log(`📋 Found ${reports.length} report(s) to update`);

    let updated = 0;
    let errors = 0;

    for (const report of reports) {
      try {
        // Replace old wording with new wording in next_steps
        const updatedNextSteps = (report.next_steps || "").replace(
          new RegExp(OLD_WORDING, "g"),
          NEW_WORDING
        );

        // Also update the summary JSON if it contains the old wording
        let updatedSummary = report.summary;
        if (report.summary && report.summary.includes(OLD_WORDING)) {
          const summaryObj = typeof report.summary === "string" 
            ? JSON.parse(report.summary) 
            : report.summary;
          
          if (summaryObj.nextMove) {
            if (Array.isArray(summaryObj.nextMove)) {
              summaryObj.nextMove = summaryObj.nextMove.map((move: string) =>
                move.replace(new RegExp(OLD_WORDING, "g"), NEW_WORDING)
              );
            } else if (typeof summaryObj.nextMove === "string") {
              summaryObj.nextMove = summaryObj.nextMove.replace(
                new RegExp(OLD_WORDING, "g"),
                NEW_WORDING
              );
            }
          }
          updatedSummary = JSON.stringify(summaryObj);
        }

        const { error: updateError } = await supabase
          .from("parent_reports")
          .update({
            next_steps: updatedNextSteps,
            summary: updatedSummary,
          })
          .eq("id", report.id);

        if (updateError) {
          console.error(`❌ Error updating report ${report.id}:`, updateError);
          errors++;
        } else {
          console.log(`✅ Updated report ${report.id}`);
          updated++;
        }
      } catch (error) {
        console.error(`❌ Error processing report ${report.id}:`, error);
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
  }
}

backfillClarityNextMoves();
