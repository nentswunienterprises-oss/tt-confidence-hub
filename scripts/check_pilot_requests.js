import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    console.log('Checking leadership_pilot_requests...');
    const { data: ldata, error: lerr } = await supabase
      .from('leadership_pilot_requests')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(10);

    if (lerr) {
      console.error('Error fetching leadership:', lerr);
    } else {
      console.log('Leadership count (fetched up to 10):', ldata?.length || 0);
      console.log(ldata);
    }

    console.log('\nChecking early_intervention_requests...');
    const { data: edata, error: eerr } = await supabase
      .from('early_intervention_requests')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(10);

    if (eerr) {
      console.error('Error fetching early intervention:', eerr);
    } else {
      console.log('Early intervention count (fetched up to 10):', edata?.length || 0);
      console.log(edata);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
})();