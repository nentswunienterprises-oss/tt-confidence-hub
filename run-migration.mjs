import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_CONNECTION;
if (!connectionString) {
  console.error('❌ Missing DATABASE_URL / POSTGRES_CONNECTION environment variable.');
  process.exit(1);
}

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
