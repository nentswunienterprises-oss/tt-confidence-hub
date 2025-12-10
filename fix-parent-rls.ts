import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

async function fixParentEnrollmentsRLS() {
  const client = new pg.Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Drop existing policies
    const policies = [
      'parents_read_own_enrollment',
      'parents_update_own_enrollment',
      'parents_insert_enrollment',
      'hr_read_enrollments'
    ];

    for (const policy of policies) {
      try {
        await client.query(`DROP POLICY IF EXISTS "${policy}" ON parent_enrollments;`);
        console.log(`✅ Dropped policy: ${policy}`);
      } catch (e) {
        console.log(`⏭️  Policy ${policy} didn't exist`);
      }
    }

    // Disable RLS
    await client.query('ALTER TABLE parent_enrollments DISABLE ROW LEVEL SECURITY;');
    console.log('✅ Disabled RLS on parent_enrollments');

    // Verify the table
    const result = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE tablename = 'parent_enrollments' AND schemaname = 'public'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Table exists: parent_enrollments');
    }

    // Check for data
    const dataResult = await client.query('SELECT COUNT(*) as count FROM parent_enrollments;');
    console.log(`✅ Table contains ${dataResult.rows[0].count} records`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixParentEnrollmentsRLS().then(() => {
  console.log('\n✨ RLS fix completed successfully!');
});
