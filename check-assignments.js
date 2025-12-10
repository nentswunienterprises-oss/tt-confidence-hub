import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.yzcnavucvwgmulcxgxvw:Rapismylife19@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'
});

async function checkAssignments() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get all tutor assignments
    const result = await client.query(`
      SELECT 
        ta.id, 
        ta.tutor_id, 
        ta.pod_id,
        u.email,
        u.name,
        p.pod_name,
        p.id as pod_uuid
      FROM tutor_assignments ta
      JOIN users u ON ta.tutor_id = u.id
      JOIN pods p ON ta.pod_id = p.id
      ORDER BY ta.created_at DESC;
    `);

    console.log('\n📋 All Tutor Assignments:');
    result.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.email}) → Pod #${row.pod_name} (Tutor ID: ${row.tutor_id})`);
    });

    // Get all tutor applications
    const applicationResult = await client.query(`
      SELECT 
        ta.user_id,
        ta.status,
        u.name,
        u.email,
        u.id
      FROM tutor_applications ta
      JOIN users u ON ta.user_id = u.id
      ORDER BY ta.created_at DESC;
    `);

    console.log('\n📋 All Tutor Applications:');
    applicationResult.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.email}) ID: ${row.id} Status: ${row.status}`);
    });

    // Get all tutors
    const tutorsResult = await client.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role
      FROM users u
      WHERE u.role = 'tutor'
      ORDER BY u.created_at DESC;
    `);

    console.log('\n👥 All Tutors (by role):');
    tutorsResult.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.email}) ID: ${row.id}`);
    });

    console.log('\n📊 Summary:');
    console.log(`  Total tutors by role: ${tutorsResult.rows.length}`);
    console.log(`  Applications (any status): ${applicationResult.rows.length}`);
    console.log(`  Assignments: ${result.rows.length}`);

    // Simulate what the endpoint returns
    const simulatedEndpointResponse = result.rows.map(row => row.tutor_id);
    console.log('\n🔌 Simulated /api/coo/all-tutor-assignments response:');
    console.log(simulatedEndpointResponse);
    
    // Simulate the filter
    const approvedTutorIds = applicationResult.rows.map(row => row.id);
    console.log('\n👥 Approved tutor IDs (from applications):');
    console.log(approvedTutorIds);
    
    console.log('\n🔍 Filter check - Thendo would appear in "Add Tutors" if:');
    console.log(`  Thendo ID (b69c8eb7-a6e7-41c2-acda-61ebd75908dc) is in assignedTutorIds? ${simulatedEndpointResponse.includes('b69c8eb7-a6e7-41c2-acda-61ebd75908dc')}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAssignments();
