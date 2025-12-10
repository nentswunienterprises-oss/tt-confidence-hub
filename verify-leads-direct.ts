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

async function verifyLeads() {
  console.log('📊 Checking leads table directly...\n');

  // Get all leads with all columns
  const { data: allLeads, error: allError } = await supabase
    .from('leads')
    .select('*');

  if (allError) {
    console.error('❌ Error fetching all leads:', allError);
  } else {
    console.log(`\nTotal leads in table: ${allLeads.length}`);
    console.log('All leads:', JSON.stringify(allLeads, null, 2));
  }

  // Specifically check for Jake and Zamo
  const jakeEmail = 'jake@gmail.com';
  const zamoEmail = 'zamo@gmail.com';

  const { data: users } = await supabase
    .from('users')
    .select('id, name, email')
    .in('email', [jakeEmail, zamoEmail]);

  console.log('\nJake and Zamo user IDs:', users);

  if (users) {
    for (const user of users) {
      const { data: leadByUserId, error: userIdError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id);

      console.log(`\nLead for ${user.name} (user_id = ${user.id}):`);
      if (userIdError) {
        console.error('Error:', userIdError);
      } else {
        console.log(leadByUserId);
      }
    }
  }
}

verifyLeads();
