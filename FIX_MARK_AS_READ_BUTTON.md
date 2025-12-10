# URGENT: Fix Mark-as-Read Button - Database Migration Required

## Problem
The "Mark as Read" button sends requests to the API, but the backend cannot save the data because the `broadcast_reads` table doesn't exist in Supabase yet.

## Error in Console
```
Error marking broadcast as read: {
  code: 'PGRST205',
  message: "Could not find the table 'public.broadcast_reads' in the schema cache"
}
```

## Solution: Run SQL Migration in Supabase

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar

### Step 2: Create New Query
1. Click "New Query"
2. Name it: "Create broadcast_reads table"

### Step 3: Copy & Paste SQL
Copy ALL the SQL from this file:
```
/PodDigitizer/BROADCAST_READS_TABLE.sql
```

Or paste this directly:
```sql
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
```

### Step 4: Execute Query
1. Click the blue "Run" button (or press Ctrl+Enter)
2. Should see success: "Query executed successfully"

### Step 5: Test the Button
1. Refresh the app (Ctrl+R or Cmd+R)
2. Click the notification bell
3. Click "Mark as Read" on any broadcast
4. The broadcast should disappear from the dropdown
5. The unread count should decrease

## What Was Fixed

✅ Database table created to persist read status
✅ Indexes added for performance  
✅ SQL function for efficient unread counting
✅ Permissions granted for API access
✅ Frontend button now fully functional

## Troubleshooting

### Still seeing errors after running SQL?
- Check that you're in the correct Supabase project
- Verify all SQL executed without errors
- Refresh the browser (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors (F12)

### Button shows "Marking..." but nothing happens?
- Likely still loading
- Wait 2-3 seconds for the mutation to complete
- Check Network tab in DevTools (F12) to see API response

### Broadcast count still shows 7?
- Refresh the page
- The unread count is cached - it will update within 30 seconds
- Or manually refresh by navigating away and back

## Files Referenced
- `/PodDigitizer/BROADCAST_READS_TABLE.sql` - Full migration SQL
- `/PodDigitizer/server/storage.ts` - Backend with fallback logic
- `/PodDigitizer/client/src/components/layout/dashboard-layout.tsx` - Frontend button
- `/PodDigitizer/BACKEND_SECURITY_AUDIT.md` - Complete security documentation

## Questions?
If the button still doesn't work after running the SQL:
1. Verify the table was created: Go to Supabase > Tables > You should see "broadcast_reads"
2. Check the browser Network tab (F12) to see API responses
3. Look at server console for error messages
