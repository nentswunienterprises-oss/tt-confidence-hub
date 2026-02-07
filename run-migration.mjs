import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = 'postgresql://postgres.yzcnavucvwgmulcxgxvw:Rapismylife19@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

async function runMigration() {
  const client = new Client({ connectionString });
  
  try {
    console.log('📦 Connecting to database...');
    await client.connect();
    
    console.log('📋 Reading migration file...');
    const migrationPath = path.join(process.cwd(), 'migrations', '0009_affiliate_prospecting.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Executing migration...');
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('affiliate_codes', 'encounters', 'leads', 'closes', 'affiliate_reflections')
    `);
    
    console.log('📊 Created tables:', result.rows.map((r: any) => r.tablename).join(', '));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
