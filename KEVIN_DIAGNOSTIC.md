# Kevin's Student Portal Diagnostic

## Current Status Check

Kevin's student portal should have these 5 navigation items:
1. ✅ Dashboard - Shows gamified stats (boss battles, solutions, streak, sessions)
2. ✅ Growth - Create commitments and reflections
3. ✅ Academic Tracker - View current topics, mastered topics, struggle targets
4. ✅ Assignments - View and submit assignments from tutors
5. ✅ Updates - View parent reports and tutor notes

## Most Likely Issue: Database Tables Missing

The student portal requires these database tables that are created by running the migration:

- `student_commitments` - For tracking Kevin's personal commitments
- `commitment_logs` - For tracking daily completion streaks
- `student_reflections` - For Kevin's reflection journal
- `assignments` - For tutor-assigned work
- `parent_reports` - For progress reports Kevin can see

**If Kevin sees empty pages or errors**, it's because the migration hasn't been run yet.

## Solution: Run the Migration

1. Go to Supabase Dashboard → SQL Editor
2. Open file: `migrations/0016_student_parent_features.sql`
3. Copy all contents and paste into Supabase SQL Editor
4. Click "Run"

## After Migration: Restart Server

```powershell
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
npm run dev
```

## Testing Kevin's Access

1. **Sign in as Kevin** at `/client/student` using his student credentials
2. **Check navigation** - Should see 5 items in the sidebar
3. **Visit each page**:
   - Dashboard: Should show stats (will be 0 if no sessions logged yet)
   - Growth: Should allow creating commitments and reflections
   - Academic Tracker: Will be empty until tutor fills in academic profile
   - Assignments: Will be empty until tutor creates assignments
   - Updates: Will be empty until parent reports are generated

## Expected Behavior Before Data Exists

Even with migration run, Kevin will see **empty states** until:
- Tutor logs sessions with boss_battles_count and solutions_count
- Tutor creates assignments for Kevin
- Kevin creates his own commitments and reflections
- Academic profile is filled by tutor
- Parent reports are generated

**Empty pages with "No data yet" messages are NORMAL for a new student!**

## Troubleshooting

### Issue: "Network Error" or "Failed to fetch"
**Cause:** Server not running or migration not applied
**Fix:** Restart server after running migration

### Issue: Blank/white screen
**Cause:** JavaScript error or auth not working
**Fix:** Check browser console (F12) for errors

### Issue: Navigation not showing
**Cause:** Student auth not detected
**Fix:** Check that `/api/student/me` returns student data (check Network tab)

### Issue: 401 Unauthorized on API calls
**Cause:** Not signed in as student
**Fix:** Sign out and sign back in at `/client/student`

## Quick Verification Commands

Check if student is authenticated:
```
Navigate to: /api/student/me
Should return: { id, email, firstName, lastName, studentId }
```

Check if migration ran:
```sql
-- Run this in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('student_commitments', 'assignments', 'student_reflections', 'parent_reports');
```

Should return all 4 table names if migration succeeded.
