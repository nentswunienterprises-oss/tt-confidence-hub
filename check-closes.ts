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

async function checkCloses() {
  console.log('📊 Checking closes...\n');

  const { data: closes, error } = await supabase
    .from('closes')
    .select('*');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${closes.length} closes:`);
  console.log(JSON.stringify(closes, null, 2));
}

checkCloses();
