import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.yzcnavucvwgmulcxgxvw:Rapismylife19@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'
});

async function createTable() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL');

    const queries = [
      `CREATE TABLE IF NOT EXISTS public.broadcast_reads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        broadcast_id UUID NOT NULL,
        read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, broadcast_id)
      );`,

      `CREATE INDEX IF NOT EXISTS idx_broadcast_reads_user_id 
        ON public.broadcast_reads(user_id);`,

      `CREATE INDEX IF NOT EXISTS idx_broadcast_reads_broadcast_id 
        ON public.broadcast_reads(broadcast_id);`,

      `CREATE INDEX IF NOT EXISTS idx_broadcast_reads_user_broadcast 
        ON public.broadcast_reads(user_id, broadcast_id);`,

      `CREATE OR REPLACE FUNCTION get_unread_broadcast_count(p_user_id UUID)
        RETURNS TABLE(count INT) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            COUNT(b.id)::INT as count
          FROM broadcasts b
          LEFT JOIN broadcast_reads br ON b.id = br.broadcast_id AND br.user_id = p_user_id
          WHERE br.id IS NULL;
        END;
        $$ LANGUAGE plpgsql;`,

      `GRANT EXECUTE ON FUNCTION get_unread_broadcast_count(UUID) TO anon;`,
      `GRANT EXECUTE ON FUNCTION get_unread_broadcast_count(UUID) TO authenticated;`
    ];

    for (const query of queries) {
      await client.query(query);
      console.log('✅ Query executed successfully');
    }

    console.log('\n🎉 broadcast_reads table and indexes created successfully!');
    console.log('✅ Function get_unread_broadcast_count created!');
    console.log('✅ Permissions granted!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createTable();
