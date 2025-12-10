import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || 'https://yzcnavucvwgmulcxgxvw.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function runMigration() {
  try {
    console.log('📋 Reading migration file...');
    const migrationPath = path.join(process.cwd(), 'migrations', '0009_affiliate_prospecting.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Executing migration...');
    
    // Split SQL statements by semicolon and execute each one
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    let successCount = 0;
    for (const statement of statements) {
      if (!statement.trim()) continue;
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.log(`⚠️ Statement result:`, error.message);
        } else {
          successCount++;
        }
      } catch (err: any) {
        console.log(`⚠️ Statement error:`, err.message);
      }
    }
    
    console.log(`✅ Migration completed! (${successCount} statements executed)`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
