-- URGENT: Run this SQL in Supabase SQL Editor to enable broadcast read tracking
-- Navigate to: Supabase Dashboard > Your Project > SQL Editor > New Query
-- Copy and paste the entire content below and execute

-- Create broadcast_reads table for tracking which broadcasts users have read
CREATE TABLE IF NOT EXISTS public.broadcast_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  broadcast_id UUID NOT NULL REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, broadcast_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_broadcast_reads_user_id 
  ON public.broadcast_reads(user_id);

CREATE INDEX IF NOT EXISTS idx_broadcast_reads_broadcast_id 
  ON public.broadcast_reads(broadcast_id);

CREATE INDEX IF NOT EXISTS idx_broadcast_reads_user_broadcast 
  ON public.broadcast_reads(user_id, broadcast_id);

CREATE INDEX IF NOT EXISTS idx_broadcasts_id 
  ON public.broadcasts(id);

-- Create efficient function for getting unread count
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

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_unread_broadcast_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_unread_broadcast_count(UUID) TO authenticated;

-- Enable Row Level Security if needed
-- ALTER TABLE public.broadcast_reads ENABLE ROW LEVEL SECURITY;

-- Optional RLS Policy: Users can only see their own reads
-- CREATE POLICY "Users can only view their own read statuses" 
--   ON public.broadcast_reads 
--   FOR SELECT 
--   USING (auth.uid() = user_id);

-- Optional RLS Policy: Users can only insert their own reads
-- CREATE POLICY "Users can only mark broadcasts as read for themselves" 
--   ON public.broadcast_reads 
--   FOR INSERT 
--   WITH CHECK (auth.uid() = user_id);
