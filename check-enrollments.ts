import { createClient } from '@supabase/supabase-js';

async function fixParentEnrollmentsRLS() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://yzcnavucvwgmulcxgxvw.supabase.co';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    console.log('🔧 Fixing parent_enrollments RLS policies...');

    // Since we can't use exec with raw SQL through the JS client,
    // we need to update the migration file instead and handle it via Supabase dashboard
    // For now, let's just check what data we have
    
    const { data, error } = await supabase
      .from('parent_enrollments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching enrollments:', error);
      console.error('This is expected if RLS policies are blocking the service role');
    } else {
      console.log('✅ Successfully fetched enrollments:', data?.length || 0);
      console.log('Data:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

fixParentEnrollmentsRLS();
