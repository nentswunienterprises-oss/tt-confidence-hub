-- Create efficient database function for unread count calculation
-- This uses a single SQL query instead of fetching all broadcasts and comparing in application code

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

-- Alternative fallback version using EXCEPT (in case rpc function doesn't work)
-- This can be called directly if needed:
-- SELECT COUNT(*) FROM broadcasts 
-- WHERE id NOT IN (SELECT broadcast_id FROM broadcast_reads WHERE user_id = 'user-id');

-- Grant permission to anon role (if using Supabase with public auth)
GRANT EXECUTE ON FUNCTION get_unread_broadcast_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_unread_broadcast_count(UUID) TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_broadcast_reads_user_id ON broadcast_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_reads_broadcast_id ON broadcast_reads(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_reads_user_broadcast ON broadcast_reads(user_id, broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_id ON broadcasts(id);

-- Optional: Create a materialized view for super-high traffic scenarios
-- (comment out if not needed)
-- CREATE MATERIALIZED VIEW unread_broadcast_counts AS
-- SELECT 
--   u.id as user_id,
--   COUNT(b.id) as unread_count
-- FROM users u
-- CROSS JOIN broadcasts b
-- LEFT JOIN broadcast_reads br ON b.id = br.broadcast_id AND br.user_id = u.id
-- WHERE br.id IS NULL
-- GROUP BY u.id;
-- CREATE INDEX idx_unread_broadcast_counts_user_id ON unread_broadcast_counts(user_id);
