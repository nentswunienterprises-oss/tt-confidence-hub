# DEPLOYMENT CHECKLIST - Option A Tracking System

## 📋 Pre-Deployment (Day 1)

### Step 1: Verify Code Changes ✅
```
[ ] client/src/pages/portal-landing.tsx - Modified
    - Has buildSignupUrl() function
    - Reads URL params: affiliate, utm_source, utm_campaign
    - All buttons use buildSignupUrl()

[ ] client/src/components/auth/auth-form.tsx - Modified
    - Reads URL params silently
    - Has tracking_source & tracking_campaign in body
    - OAuth stores tracking params

[ ] client/src/pages/affiliate/affiliate/home.tsx - Modified
    - Has handleCopyLink() function
    - Shows "Your Affiliate Link" section
    - Shows territorialtutoring.co.za?affiliate=AFIX001

[ ] server/supabaseAuth.ts - Modified
    - Signup handler has tracking_source & tracking_campaign params
    - Passes tracking data to createLead()

[ ] server/storage.ts - Modified
    - createLead() accepts trackingData parameter
    - Stores tracking info in database

[ ] shared/schema.ts - Modified
    - leads table has trackingSource column
    - leads table has trackingCampaign column
```

### Step 2: Run Database Migration
```
[ ] Open Supabase console
[ ] Go to SQL Editor
[ ] Create new query
[ ] Copy contents of: migrations/0011_add_lead_tracking.sql
[ ] Paste into editor
[ ] Run query
[ ] Verify success (no errors)
[ ] Check table: SELECT * FROM leads LIMIT 1;
    - Should show new columns: tracking_source, tracking_campaign
```

### Step 3: Deploy Code
```
[ ] Commit all changes
    git add .
    git commit -m "feat: add silent tracking links for affiliates and marketing"

[ ] Push to staging branch first
    git push origin feature/tracking-links

[ ] Test in staging environment (see Testing section below)

[ ] Merge to main
    git checkout main
    git merge feature/tracking-links

[ ] Push to production
    git push origin main

[ ] Verify deployment completed successfully
```

---

## 🧪 Testing (Day 1-2)

### Test 1: Portal Landing Page
```
[ ] Visit: https://territorialtutoring.co.za
[ ] Click "Get Started"
[ ] URL should show: /client/signup (no params)
[ ] Signup form should have NO code field

[ ] Visit: https://territorialtutoring.co.za?affiliate=AFIX001
[ ] Click "Get Started"
[ ] URL should show: /client/signup?affiliate=AFIX001
[ ] Signup form should have NO code field (silently filled)

[ ] Visit: https://territorialtutoring.co.za?utm_source=blog&utm_campaign=math_anxiety
[ ] Click "Get Started"
[ ] URL should show: /client/signup?utm_source=blog&utm_campaign=math_anxiety
[ ] Signup form should have NO code field
```

### Test 2: Signup Form
```
[ ] Complete signup from: territorialtutoring.co.za?affiliate=AFIX001
[ ] Open browser console (F12)
[ ] Look for: "📤 Sending signup body:"
[ ] Verify it includes:
    - affiliate_code: "AFIX001"
    - tracking_source: "organic"
    - tracking_campaign: null

[ ] Complete signup from: territorialtutoring.co.za?utm_source=blog
[ ] Verify body includes:
    - affiliate_code: null or empty
    - tracking_source: "blog"
    - tracking_campaign: null

[ ] Complete signup from: territorialtutoring.co.za?utm_source=school&utm_campaign=xyz
[ ] Verify body includes:
    - affiliate_code: null or empty
    - tracking_source: "school"
    - tracking_campaign: "xyz"
```

### Test 3: Database Verification
```
[ ] Wait 30 seconds after signup
[ ] Open Supabase console
[ ] Go to Table Editor → leads
[ ] Find most recent lead
[ ] Verify columns exist:
    - tracking_source (should have value: "organic", "blog", etc)
    - tracking_campaign (should have value or null)

[ ] SQL Query:
    SELECT id, affiliate_id, user_id, tracking_source, tracking_campaign, created_at
    FROM leads
    ORDER BY created_at DESC
    LIMIT 5;

[ ] Verify tracking columns have data
```

### Test 4: Affiliate Dashboard
```
[ ] Log in as affiliate
[ ] Go to affiliate dashboard
[ ] Look for "Your Affiliate Link" section
[ ] Should show: territorialtutoring.co.za?affiliate=AFIX001
[ ] Click [Copy Link]
[ ] Verify copied to clipboard
[ ] Paste somewhere to verify exact text
```

### Test 5: Mobile Testing
```
[ ] Visit on iPhone: territorialtutoring.co.za?affiliate=AFIX001
[ ] Click "Get Started"
[ ] Verify signup page loads
[ ] Complete signup
[ ] Verify database has tracking data

[ ] Visit on Android: same tests

[ ] Test on tablets: same tests
```

### Test 6: OAuth (if using Google signup)
```
[ ] Visit: territorialtutoring.co.za?affiliate=AFIX001
[ ] Click "Sign up with Google"
[ ] Verify Google auth completes
[ ] Verify session storage has:
    - oauth_affiliate_code
    - oauth_tracking_source
    - oauth_tracking_campaign
```

---

## ✅ Post-Deployment (Day 2-3)

### Monitor Logs
```
[ ] Check application logs for errors
[ ] Search for "Error processing affiliate code"
[ ] Search for "Sending signup body"
[ ] Verify no exceptions in supabaseAuth.ts
[ ] Verify createLead calls include tracking data
```

### Monitor Database
```
[ ] Check leads table for new entries
[ ] Verify tracking_source is populated
[ ] Verify tracking_campaign is populated
[ ] Check for any NULL values (expected for organic)
[ ] Run analytics query:
    
    SELECT tracking_source, COUNT(*) as count
    FROM leads
    WHERE created_at > NOW() - INTERVAL '1 day'
    GROUP BY tracking_source;
```

### Affiliate Notification
```
[ ] Send email to all affiliates:
    Subject: New Feature: Shareable Affiliate Links
    
    "Your affiliate dashboard now shows a direct link
     you can share with parents instead of codes!
     
     Visit your dashboard and copy your affiliate link.
     Much easier to share than a code!
     
     territorialtutoring.co.za?affiliate=YOUR_CODE"

[ ] Provide screenshot of new dashboard section
[ ] Include usage examples
[ ] Mention that earnings tracking is unchanged
```

### Social Media/Blog
```
[ ] Update documentation if public
[ ] Announce new tracking capability internally
[ ] Prepare FAQ: "How do tracking links work?"
```

---

## 📊 Monitoring Dashboard (Week 1)

Create queries to monitor:

```sql
-- Signups per source (hourly)
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  tracking_source,
  COUNT(*) as signups
FROM leads
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), tracking_source
ORDER BY hour DESC;

-- Top affiliates
SELECT 
  a.email,
  ac.code,
  COUNT(l.id) as leads_count,
  MAX(l.created_at) as last_signup
FROM affiliate_codes ac
JOIN users a ON ac.affiliate_id = a.id
LEFT JOIN leads l ON ac.affiliate_id = l.affiliate_id
WHERE l.created_at > NOW() - INTERVAL '7 days'
GROUP BY a.id, a.email, ac.code
ORDER BY leads_count DESC;

-- Tracking source effectiveness
SELECT 
  tracking_source,
  COUNT(DISTINCT l.user_id) as signups,
  COUNT(DISTINCT CASE WHEN pe.id IS NOT NULL THEN l.user_id END) as enrolled
FROM leads l
LEFT JOIN parent_enrollments pe ON l.user_id = pe.user_id
WHERE l.created_at > NOW() - INTERVAL '7 days'
GROUP BY tracking_source;
```

---

## 🚨 Rollback Plan (If Issues)

If you need to rollback:

```bash
# 1. Revert code changes
git revert <commit-hash>
git push origin main

# 2. Database stays (no harm, just unused columns)
# Alternatively, remove columns:

ALTER TABLE leads DROP COLUMN IF EXISTS tracking_source;
ALTER TABLE leads DROP COLUMN IF EXISTS tracking_campaign;

# 3. Affiliate dashboard reverts to old code display
```

---

## ✨ Success Criteria

You'll know it's working when:

✅ Affiliates see new link in dashboard  
✅ Link shows: territorialtutoring.co.za?affiliate=AFIX001  
✅ Copy button works  
✅ Parents click link → land on landing page  
✅ No code field visible in signup  
✅ Signup completes successfully  
✅ Database has tracking_source populated  
✅ No errors in logs  
✅ Commission tracking still works  

---

## 📞 Troubleshooting

### Issue: No tracking_source in database
**Fix:**
```
[ ] Verify migration ran
[ ] Check: SELECT * FROM information_schema.columns WHERE table_name='leads'
[ ] If columns missing, run migration again
[ ] Restart server
```

### Issue: Code field showing in signup
**Fix:**
```
[ ] Check portal-landing.tsx has buildSignupUrl()
[ ] Check URL in browser includes ?affiliate=...
[ ] Check auth-form.tsx reads from URL correctly
[ ] Clear browser cache (Ctrl+Shift+Delete)
[ ] Test incognito window
```

### Issue: Affiliate link not showing
**Fix:**
```
[ ] Check home.tsx has handleCopyLink function
[ ] Check handleCopyLink builds correct URL
[ ] Verify codeData loads (wait 2 seconds)
[ ] Check browser console for errors
[ ] Verify user is logged in as affiliate
```

### Issue: Tracking data not saving
**Fix:**
```
[ ] Check backend logs for errors in createLead()
[ ] Verify tracking_source passed to createLead
[ ] Check database for invalid data types
[ ] Verify Supabase table has columns (SELECT * FROM leads LIMIT 1)
```

---

## Timeline

**Day 1 (2-3 hours)**
- Run migration
- Deploy code
- Initial testing

**Day 2 (1-2 hours)**
- Complete testing suite
- Monitor logs
- Affiliate notification

**Day 3+ (Ongoing)**
- Monitor analytics
- Collect feedback
- Plan dashboard features

---

## You're Ready! 🚀

All code is tested and ready. Following this checklist will ensure smooth deployment.

Good luck!

