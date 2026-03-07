import 'dotenv/config';
import { supabase } from "../server/storage";

async function backfillStudentParentIds() {
  // Get all students missing parent_id
  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id, parent_contact")
    .is("parent_id", null);
  if (studentError) throw studentError;
  let updated = 0;
  for (const student of students) {
    if (!student.parent_contact) continue;
    // Find parent_enrollment by email
    const { data: parentRow } = await supabase
      .from("parent_enrollments")
      .select("user_id")
      .eq("parent_email", student.parent_contact)
      .maybeSingle();
    if (parentRow && parentRow.user_id) {
      // Update student with parent_id
      await supabase
        .from("students")
        .update({ parent_id: parentRow.user_id })
        .eq("id", student.id);
      updated++;
      console.log(`Updated student ${student.id} with parent_id ${parentRow.user_id}`);
    }
  }
  console.log(`Backfill complete. Updated ${updated} students.`);
}

backfillStudentParentIds().catch(console.error);
