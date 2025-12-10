import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkLeads() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://yzcnavucvwgmulcxgxvw.supabase.co';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // Get all leads
    const { data: allLeads } = await supabase
      .from('leads')
      .select('*, parent:users!parent_id(name, email), affiliate:users!affiliate_id(name)');
    
    console.log('\n📊 ALL LEADS:\n');
    console.log(JSON.stringify(allLeads, null, 2));

    // Check Jake and Zamo specifically
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email')
      .or('name.ilike.%Jake%,name.ilike.%Zamo%');

    console.log('\n👥 Jake and Zamo users:\n');
    console.log(JSON.stringify(users, null, 2));

    if (users) {
      for (const user of users) {
        const { data: lead } = await supabase
          .from('leads')
          .select('*, affiliate:users!affiliate_id(name)')
          .eq('parent_id', user.id)
          .maybeSingle();
        
        console.log(`\n🔍 Lead for ${user.name}:`);
        console.log(JSON.stringify(lead, null, 2));
      }
    }

    // Check Mendy
    const { data: mendy } = await supabase
      .from('users')
      .select('id, name, email')
      .ilike('name', '%Mendy%')
      .maybeSingle();

    if (mendy) {
      const { data: mendyLead } = await supabase
        .from('leads')
        .select('*, affiliate:users!affiliate_id(name)')
        .eq('parent_id', mendy.id)
        .maybeSingle();
      
      console.log(`\n🔍 Lead for Mendy:`);
      console.log(JSON.stringify(mendyLead, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkLeads();
