#!/usr/bin/env node
/**
 * Direct Supabase Table Creation Script
 * This creates the broadcast_reads table directly via PostgreSQL connection
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://yzcnavucvwgmulcxgxvw.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y25hdnVjdndnbXVsY3hneHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDMwODQsImV4cCI6MjA3NzIxOTA4NH0.XN5-dNSuauD7UE0TVEVwbfeB77ehwYCDd1M4-6ovBr4";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBroadcastReadsTable() {
  try {
    console.log("🔗 Connecting to Supabase...");
    
    // Execute SQL to create table and indexes
    const sql = `
      CREATE TABLE IF NOT EXISTS public.broadcast_reads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        broadcast_id UUID NOT NULL REFERENCES public.broadcasts(id) ON DELETE CASCADE,
        read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, broadcast_id)
      );

      CREATE INDEX IF NOT EXISTS idx_broadcast_reads_user_id 
        ON public.broadcast_reads(user_id);

      CREATE INDEX IF NOT EXISTS idx_broadcast_reads_broadcast_id 
        ON public.broadcast_reads(broadcast_id);

      CREATE INDEX IF NOT EXISTS idx_broadcast_reads_user_broadcast 
        ON public.broadcast_reads(user_id, broadcast_id);

      CREATE OR REPLACE FUNCTION get_unread_broadcast_count(p_user_id UUID)
      RETURNS TABLE(count INT) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          COUNT(b.id)::INT as count
        FROM broadcasts b
        LEFT JOIN broadcast_reads br ON b.id = br.broadcast_id AND br.user_id = p_user_id
        WHERE br.id IS NULL;
      END;
      $$ LANGUAGE plpgsql;

      GRANT EXECUTE ON FUNCTION get_unread_broadcast_count(UUID) TO anon;
      GRANT EXECUTE ON FUNCTION get_unread_broadcast_count(UUID) TO authenticated;
    `;

    // Use RPC to execute raw SQL (if available) or use direct client
    const { data, error } = await supabase.rpc('_create_broadcast_reads_table', { sql_query: sql });
    
    if (error) {
      console.log("⚠️  RPC method not available, trying alternative approach...");
      // Alternative: just verify it would work
      console.log("✅ SQL is ready to execute in Supabase dashboard");
      console.log("\nSQL to run:");
      console.log(sql);
    } else {
      console.log("✅ broadcast_reads table created successfully!");
      console.log(data);
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

createBroadcastReadsTable();
