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
    console.log('Inserting test leadership request...');
    const { data: ldata, error: lerr } = await supabase
      .from('leadership_pilot_requests')
      .insert({
        school_name: 'TEST SCHOOL - Leadership (dev)',
        contact_person_role: 'Principal - Test',
        email: 'pilot-test+leadership@example.com',
        submitter_name: 'Dev Tester',
        submitter_role: 'dev',
      })
      .select()
      .single();

    if (lerr) {
      console.error('Error inserting leadership:', lerr);
    } else {
      console.log('Inserted leadership:', ldata);
    }

    console.log('Inserting test early intervention request...');
    const { data: edata, error: eerr } = await supabase
      .from('early_intervention_requests')
      .insert({
        school_name: 'TEST SCHOOL - Early Intervention (dev)',
        contact_person_role: 'Deputy - Test',
        email: 'pilot-test+early@example.com',
        submitter_name: 'Dev Tester',
        submitter_role: 'dev',
      })
      .select()
      .single();

    if (eerr) {
      console.error('Error inserting early intervention:', eerr);
    } else {
      console.log('Inserted early intervention:', edata);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
})();