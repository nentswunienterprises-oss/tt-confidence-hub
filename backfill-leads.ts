import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

async function backfillLeads() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://yzcnavucvwgmulcxgxvw.supabase.co';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    console.log('📊 Starting lead backfill...\n');

    // Get all parent users
    const { data: parents, error: parentsError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'parent');

    if (parentsError) {
      console.error('❌ Error fetching parents:', parentsError);
      return;
    }

    console.log(`Found ${parents?.length || 0} parent users\n`);

    let leadsCreated = 0;
    let leadsSkipped = 0;
    let noAffiliate = 0;

    for (const parent of parents || []) {
      console.log(`\n👤 Processing: ${parent.name} (${parent.email})`);

      // Check if lead already exists
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('user_id', parent.id)
        .maybeSingle();

      if (existingLead) {
        console.log('   ⏭️  Lead already exists');
        leadsSkipped++;
        continue;
      }

      // Find encounter by email
      const { data: encounter } = await supabase
        .from('encounters')
        .select('id, affiliate_id, parent_email')
        .eq('parent_email', parent.email)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (!encounter) {
        console.log('   ℹ️  No encounter found for this parent');
        noAffiliate++;
        continue;
      }

      console.log(`   ✅ Found encounter with affiliate ${encounter.affiliate_id}`);

      // Create lead record
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          affiliate_id: encounter.affiliate_id,
          user_id: parent.id,
          encounter_id: encounter.id,
        });

      if (leadError) {
        console.error(`   ❌ Error creating lead:`, leadError.message);
      } else {
        console.log(`   ✅ Lead created successfully`);
        leadsCreated++;
      }
    }

    console.log('\n📊 Backfill Summary:');
    console.log(`   ✅ Leads created: ${leadsCreated}`);
    console.log(`   ⏭️  Leads skipped (already exist): ${leadsSkipped}`);
    console.log(`   ℹ️  Parents without encounters: ${noAffiliate}`);
    console.log(`   📝 Total parents processed: ${parents?.length || 0}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

backfillLeads();
