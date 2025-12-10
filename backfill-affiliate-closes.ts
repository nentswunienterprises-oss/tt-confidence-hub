import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

async function backfillAffiliateCloses() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://yzcnavucvwgmulcxgxvw.supabase.co';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    console.log('📊 Starting affiliate closes backfill...\n');

    // Find all accepted proposals
    const { data: acceptedProposals, error: proposalError } = await supabase
      .from('onboarding_proposals')
      .select(`
        id,
        enrollment_id,
        student_id,
        tutor_id,
        accepted_at
      `)
      .not('accepted_at', 'is', null);

    if (proposalError) {
      console.error('❌ Error fetching proposals:', proposalError);
      return;
    }

    console.log(`Found ${acceptedProposals?.length || 0} accepted proposals\n`);

    let closesCreated = 0;
    let closesSkipped = 0;

    for (const proposal of acceptedProposals || []) {
      // Get enrollment to find parent
      const { data: enrollment } = await supabase
        .from('parent_enrollments')
        .select('user_id')
        .eq('id', proposal.enrollment_id)
        .maybeSingle();

      if (!enrollment) {
        console.log(`⚠️  No enrollment found for proposal ${proposal.id}`);
        continue;
      }

      // Check if parent has a lead (came from an affiliate)
      const { data: lead } = await supabase
        .from('leads')
        .select('id, affiliate_id')
        .eq('user_id', enrollment.user_id)
        .maybeSingle();

      if (!lead) {
        console.log(`   No affiliate lead for parent ${enrollment.user_id}`);
        closesSkipped++;
        continue;
      }

      // Check if close already exists
      const { data: existingClose } = await supabase
        .from('closes')
        .select('id')
        .eq('lead_id', lead.id)
        .maybeSingle();

      if (existingClose) {
        console.log(`   Close already exists for lead ${lead.id}`);
        closesSkipped++;
        continue;
      }

      // Get tutor's assignment ID
      const { data: tutorAssignment } = await supabase
        .from('tutor_assignments')
        .select('id')
        .eq('tutor_id', proposal.tutor_id)
        .maybeSingle();

      // Create close record
      const { error: closeError } = await supabase
        .from('closes')
        .insert({
          affiliate_id: lead.affiliate_id,
          parent_id: enrollment.user_id,
          lead_id: lead.id,
          child_id: proposal.student_id,
          pod_assignment_id: tutorAssignment?.id || null,
          closed_at: proposal.accepted_at,
        });

      if (closeError) {
        console.error(`❌ Error creating close for lead ${lead.id}:`, closeError.message);
      } else {
        console.log(`✅ Created close for affiliate ${lead.affiliate_id}, parent ${enrollment.user_id}`);
        closesCreated++;
      }
    }

    console.log('\n📊 Backfill Summary:');
    console.log(`   ✅ Closes created: ${closesCreated}`);
    console.log(`   ⏭️  Closes skipped: ${closesSkipped}`);
    console.log(`   📝 Total processed: ${acceptedProposals?.length || 0}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

backfillAffiliateCloses();
