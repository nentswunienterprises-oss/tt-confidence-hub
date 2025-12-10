import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkAcceptedProposal() {
  console.log('📊 Checking accepted proposal...\n');

  const { data: proposal, error } = await supabase
    .from('onboarding_proposals')
    .select('*')
    .not('accepted_at', 'is', null)
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('Accepted proposal ID:', proposal.id);
  console.log('Enrollment ID:', proposal.enrollment_id);

  // Get enrollment to find parent
  const { data: enrollment } = await supabase
    .from('parent_enrollments')
    .select('user_id')
    .eq('id', proposal.enrollment_id)
    .single();

  if (!enrollment) {
    console.log('No enrollment found');
    return;
  }

  const parentId = enrollment.user_id;
  
  // Get parent details
  const { data: parent } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', parentId)
    .single();

  console.log(`\nParent: ${parent?.name} (${parent?.email})`);
  console.log(`Parent ID: ${parentId}`);
  console.log(`Student ID: ${proposal.student_id}`);
  console.log(`Pod ID: ${proposal.pod_id}`);
  console.log(`Accepted: ${new Date(proposal.created_at).toLocaleString()}`);

  // Check if this parent has a lead
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', parentId)
    .maybeSingle();

  console.log('\nLead record:', lead);

  // Check if close already exists
  const { data: existingClose } = await supabase
    .from('closes')
    .select('*')
    .eq('parent_id', parentId)
    .maybeSingle();

  console.log('  Close record:', existingClose);
}

checkAcceptedProposal();
