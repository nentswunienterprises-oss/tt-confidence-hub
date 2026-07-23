import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

const ceoEmail = 'nentswuni@gmail.com';
const safeRoles = ['ceo', 'coo', 'hr', 'cto', 'cmo'];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in environment.');
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    console.log('Connected to database.');

    const ceoResult = await client.query(
      `SELECT id, email, first_name, last_name, role, created_at FROM users WHERE lower(email) = $1`,
      [ceoEmail.toLowerCase()]
    );

    const cooAppointment = await client.query(
      `SELECT appointed_user_id FROM executive_role_appointments WHERE role = 'coo' LIMIT 1`
    );

    const cooId = cooAppointment.rows[0]?.appointed_user_id || null;
    const cooResult = cooId
      ? await client.query(
          `SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1`,
          [cooId]
        )
      : { rows: [] };

    const keepIds = [
      ...new Set([
        ...ceoResult.rows.map((row) => row.id),
        ...cooResult.rows.map((row) => row.id),
      ]),
    ].filter(Boolean);

    console.log('CEO record:', JSON.stringify(ceoResult.rows, null, 2));
    console.log('COO appointment row:', JSON.stringify(cooAppointment.rows, null, 2));
    console.log('COO user record:', JSON.stringify(cooResult.rows, null, 2));

    const candidateResult = await client.query(
      `SELECT id, email, first_name, last_name, role, created_at
       FROM users
       WHERE role::text = ANY($1::text[])
         AND id <> ALL($2::text[])
       ORDER BY role, created_at`,
      [safeRoles, keepIds.length ? keepIds : ['']]
    );

    console.log('Candidates to delete:', JSON.stringify(candidateResult.rows, null, 2));
    console.log('Candidate count:', candidateResult.rowCount);

    if (candidateResult.rowCount === 0) {
      console.log('No extra executive accounts found. Nothing to delete.');
      return;
    }

    const candidateIds = candidateResult.rows.map((row) => row.id);

    console.log('Deleting dependent broadcast_reads rows...');
    const broadcastDelete = await client.query(
      `DELETE FROM broadcast_reads WHERE user_id = ANY($1::text[]) RETURNING id, user_id, broadcast_id`,
      [candidateIds]
    );
    console.log('Deleted broadcast_reads rows:', JSON.stringify(broadcastDelete.rows, null, 2));
    console.log('Deleted broadcast_reads count:', broadcastDelete.rowCount);

    const deleteResult = await client.query(
      `DELETE FROM users
       WHERE id = ANY($1::text[])
       RETURNING id, email, first_name, last_name, role, created_at`,
      [candidateIds]
    );

    console.log('Deleted rows:', JSON.stringify(deleteResult.rows, null, 2));
    console.log('Deleted count:', deleteResult.rowCount);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
