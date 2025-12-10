import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || 'https://yzcnavucvwgmulcxgxvw.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  console.error('Please set it in your .env file or environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function runStudentAuthMigration() {
  try {
    console.log('📋 Reading student auth migration file...');
    const migrationPath = path.join(__dirname, 'migrations', '0016_student_auth.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Executing migration...');
    console.log('SQL to execute:');
    console.log(sql);
    console.log('\n---\n');
    
    // Split SQL statements by semicolon and execute each one
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    console.log(`Found ${statements.length} statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement.trim()) continue;
      
      console.log(`Executing statement ${i + 1}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.log(`⚠️  Statement ${i + 1} warning:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Statement ${i + 1} error:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n✅ Migration completed!`);
    console.log(`   ${successCount} statements executed successfully`);
    console.log(`   ${errorCount} statements had warnings/errors`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runStudentAuthMigration();
