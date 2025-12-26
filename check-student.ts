// Use dotenv to load environment variables
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudent() {
  const studentId = 'ad79c26c-2685-4ae1-9413-56f8905ebf9c';
  const tutorId = 'b69c8eb7-a6e7-41c2-acda-61ebd75908dc';
  
  // Check specific student
  console.log('Looking for student:', studentId);
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id, name, personal_profile, emotional_insights, academic_diagnosis, identity_sheet')
    .eq('id', studentId)
    .maybeSingle();
  
  console.log('Student query result:', JSON.stringify(student, null, 2));
  if (studentError) console.error('Student Error:', studentError);
  
  // Get all students for the tutor
  console.log('\nGetting students for tutor:', tutorId);
  const { data: tutorStudents, error: tutorError } = await supabase
    .from('students')
    .select('id, name, tutor_id')
    .eq('tutor_id', tutorId);
  
  console.log('Tutor students:', JSON.stringify(tutorStudents, null, 2));
  if (tutorError) console.error('Tutor Error:', tutorError);
  
  // List ALL students (limit 20)
  console.log('\nAll students in database:');
  const { data: allStudents } = await supabase
    .from('students')
    .select('id, name, tutor_id')
    .limit(20);
  
  console.log(JSON.stringify(allStudents, null, 2));
  
  process.exit(0);
}

checkStudent();
