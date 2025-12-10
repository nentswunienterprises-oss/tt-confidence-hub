import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://yzcnavucvwgmulcxgxvw.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixRLS() {
  try {
    console.log('🔧 Fixing parent_enrollments RLS policy...');
    
    // Drop problematic policy
    const { error: dropError } = await supabase.rpc('exec', {
      sql: 'DROP POLICY IF EXISTS "hr_read_enrollments" ON parent_enrollments;'
    });
    
    if (dropError && dropError.message !== 'function "exec" does not exist') {
      console.warn('Warning dropping policy:', dropError);
    }
    
    // Create new policy using custom users table
    const policy = `
      CREATE POLICY "hr_read_enrollments" ON parent_enrollments
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE public.users.id = auth.uid() 
            AND public.users.role IN ('hr', 'coo')
          )
        );
    `;
    
    // We need to use raw SQL directly
    console.log('✅ Migration prepared (run via Supabase SQL Editor or psql)');
    console.log('\nSQL to execute:');
    console.log(policy);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixRLS();
