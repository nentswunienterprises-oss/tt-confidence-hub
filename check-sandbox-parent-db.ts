import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');
const envVars: Record<string, string> = {};

envLines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.SUPABASE_URL || 'https://yzcnavucvwgmulcxgxvw.supabase.co';
const supabaseServiceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = envVars.DATABASE_URL;

const parentEmail = 'sandbox-parent-c9873790-52f1-49ef-88c1-28c5be6ac08f-1778009980421-0@territorialtutoring.com';

(async () => {
  try {
    if (!supabaseServiceRoleKey || !databaseUrl) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY or DATABASE_URL');
      process.exit(1);
    }

    console.log('🔍 Querying database for:', parentEmail);
    console.log('');

    // Initialize Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 1. Get parent user by email
    console.log('1️⃣  Fetching parent user...');
    const { data: parentUsers, error: parentError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('email', parentEmail);

    if (parentError) {
      console.error('Error fetching parent:', parentError);
      process.exit(1);
    }

    if (!parentUsers || parentUsers.length === 0) {
      console.error('❌ Parent not found');
      process.exit(1);
    }

    const parent = parentUsers[0];
    console.log('✅ Parent found:', {
      id: parent.id,
      email: parent.email,
      name: `${parent.first_name} ${parent.last_name}`,
      role: parent.role
    });
    console.log('');

    // 2. Get enrollments for this parent
    console.log('2️⃣  Fetching parent enrollments...');
    const { data: allEnrollments, error: allError } = await supabase
      .from('parent_enrollments')
      .select('*')
      .limit(1);

    if (allError) {
      console.error('Error fetching any enrollments:', allError);
      process.exit(1);
    }

    console.log('Sample enrollment record fields:');
    if (allEnrollments && allEnrollments.length > 0) {
      console.log(Object.keys(allEnrollments[0]).join(', '));
    }
    console.log('');

    const { data: enrollments, error: enrollmentError } = await supabase
      .from('parent_enrollments')
      .select('*')
      .ilike('parent_email', '%sandbox-parent%');

    if (enrollmentError) {
      console.error('Error fetching enrollments:', enrollmentError);
    } else {
      console.log(`✅ Found ${enrollments?.length || 0} enrollment(s):`);
      enrollments?.forEach(e => {
        console.log(`   - ID: ${e.id}`);
        console.log(`     Status: ${e.status}`);
        console.log(`     Student Full Name: ${e.student_full_name}`);
        console.log(`     Assigned Student ID: ${e.assigned_student_id || 'NOT ASSIGNED'}`);
        console.log(`     Assigned Tutor ID: ${e.assigned_tutor_id || 'NOT ASSIGNED'}`);
        console.log(`     Proposal ID: ${e.proposal_id || 'NONE'}`);
        console.log(`     Created: ${e.created_at}`);
      });
    }
    console.log('');

    // 3. Get proposals for this parent (via enrollment_id)
    console.log('3️⃣  Fetching onboarding proposals...');
    if (!enrollments || enrollments.length === 0) {
      console.log('   No enrollments found, skipping proposals');
    } else {
      const enrollmentIds = enrollments.map((e: any) => e.id);
      const { data: proposals, error: proposalError } = await supabase
        .from('onboarding_proposals')
        .select('*')
        .in('enrollment_id', enrollmentIds);

      if (proposalError) {
        console.error('Error fetching proposals:', proposalError);
      } else {
        console.log(`✅ Found ${proposals?.length || 0} proposal(s):`);
        proposals?.forEach(p => {
          console.log(`   - ID: ${p.id}`);
          console.log(`     Enrollment ID: ${p.enrollment_id}`);
          console.log(`     Student ID: ${p.student_id}`);
          console.log(`     Sent At: ${p.sent_at || 'NOT SENT'}`);
          console.log(`     Accepted At: ${p.accepted_at || 'NOT ACCEPTED'}`);
          console.log(`     Declined At: ${p.declined_at || 'NOT DECLINED'}`);
          console.log(`     Parent Code: ${p.parent_code || 'NONE'}`);
          console.log(`     Created: ${p.created_at}`);
        });
      }
    }
    console.log('');

    // 4. Get scheduled sessions for parent's students
    if (enrollments && enrollments.length > 0) {
      console.log('4️⃣  Fetching scheduled sessions...');
      for (const enrollment of enrollments) {
        const { data: sessions, error: sessionError } = await supabase
          .from('scheduled_sessions')
          .select('id, type, student_id, status, created_at, updated_at')
          .eq('student_id', enrollment.student_id);

        if (sessionError) {
          console.error(`Error fetching sessions for student ${enrollment.student_id}:`, sessionError);
        } else {
          console.log(`   Student ${enrollment.student_id}: ${sessions?.length || 0} session(s)`);
          sessions?.forEach(s => {
            console.log(`     - Type: ${s.type}, Status: ${s.status}, Created: ${s.created_at}`);
          });
        }
      }
    }
    console.log('');

    // 5. Check for training sessions
    console.log('5️⃣  Checking for pending training sessions...');
    const { data: trainingSessions, error: trainingError } = await supabase
      .from('scheduled_sessions')
      .select('id, type, student_id, status, confirmation_pending')
      .eq('type', 'training')
      .in('student_id', enrollments?.map(e => e.student_id) || []);

    if (trainingError) {
      console.error('Error fetching training sessions:', trainingError);
    } else {
      console.log(`✅ Found ${trainingSessions?.length || 0} training session(s):`);
      trainingSessions?.forEach(t => {
        console.log(`   - ID: ${t.id}, Status: ${t.status}, Confirmation Pending: ${t.confirmation_pending}`);
      });
    }

    console.log('');
    console.log('✅ Database check complete');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();
