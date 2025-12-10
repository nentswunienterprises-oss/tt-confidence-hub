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

async function checkAffiliateData() {
  console.log('📊 Checking affiliate tracking data...\n');

  // Get the affiliate
  const affiliateId = '99864cb4-3640-4c0d-b4a7-fc70d46c7a30';
  
  const { data: affiliate } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', affiliateId)
    .single();

  console.log(`👤 Affiliate: ${affiliate?.name} (${affiliate?.email})\n`);

  // Get encounters
  const { data: encounters } = await supabase
    .from('encounters')
    .select('id, parent_name, parent_email, created_at')
    .eq('affiliate_id', affiliateId);

  console.log(`🤝 Encounters: ${encounters?.length || 0}`);
  encounters?.forEach(e => {
    console.log(`   - ${e.parent_name} (${e.parent_email}) on ${new Date(e.created_at).toLocaleDateString()}`);
  });

  // Get leads
  const { data: leads } = await supabase
    .from('leads')
    .select(`
      id,
      encounter_id,
      created_at,
      user:user_id (
        name,
        email
      )
    `)
    .eq('affiliate_id', affiliateId);

  console.log(`\n📋 Leads: ${leads?.length || 0}`);
  leads?.forEach(l => {
    console.log(`   - ${l.user?.name} (${l.user?.email}) - Encounter: ${l.encounter_id || 'None'}`);
  });

  // Get closes
  const { data: closes } = await supabase
    .from('closes')
    .select(`
      id,
      lead_id,
      closed_at,
      pod_assignment_id,
      parent:parent_id (
        name,
        email
      )
    `)
    .eq('affiliate_id', affiliateId);

  console.log(`\n💰 Closes: ${closes?.length || 0}`);
  closes?.forEach(c => {
    console.log(`   - ${c.parent?.name} (${c.parent?.email}) - Lead: ${c.lead_id}, Assignment: ${c.pod_assignment_id || 'None'}, Closed: ${new Date(c.closed_at).toLocaleDateString()}`);
  });

  console.log(`\n📊 Summary for ${affiliate?.name}:`);
  console.log(`   Encounters: ${encounters?.length || 0}`);
  console.log(`   Leads: ${leads?.length || 0}`);
  console.log(`   Closes: ${closes?.length || 0}`);
}

checkAffiliateData();
