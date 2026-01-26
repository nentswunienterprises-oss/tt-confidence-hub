# Quick Reference: Option A Tracking Implementation

## 🚀 What Just Got Built

A complete silent tracking system that lets you:
- Track which affiliate referred each signup
- Track organic/blog/school discovery channels
- Show affiliates clean shareable links
- Keep user experience frictionless

---

## 📝 How to Use

### For Affiliates
1. Go to affiliate dashboard
2. See "Your Affiliate Link: territorialtutoring.co.za?affiliate=AFIX001"
3. Click [Copy Link]
4. Send to parents
5. Done - earnings tracked automatically

### For Marketing
1. Blog post: Use link `territorialtutoring.co.za?utm_source=blog&utm_campaign=anxiety`
2. School partnership: Use `territorialtutoring.co.za?utm_source=school&utm_campaign=pinewood`
3. Social media: Use `territorialtutoring.co.za?utm_source=social&utm_campaign=instagram`

### For Parents
Same signup experience:
- Click link
- See landing page
- Click "Get Started"
- Fill signup form
- Done (code handled silently)

---

## 📊 What Data Gets Tracked

When parent signs up from link, system records:
```
{
  user_id: "parent_123",
  affiliate_id: "affiliate_456",  // If from affiliate link
  tracking_source: "blog",        // Or "affiliate", "school", "organic"
  tracking_campaign: "anxiety",   // Or campaign name
  created_at: "2026-01-26T..."
}
```

---

## 🔗 Link Formats

All these links work automatically:

```
# Affiliate
territorialtutoring.co.za?affiliate=AFIX001

# Blog
territorialtutoring.co.za?utm_source=blog&utm_campaign=math_anxiety

# School
territorialtutoring.co.za?utm_source=school&utm_campaign=pinewood_academy

# Social
territorialtutoring.co.za?utm_source=social&utm_campaign=instagram

# Mixed (Affiliate + Campaign)
territorialtutoring.co.za?affiliate=AFIX001&utm_campaign=summer_referrals
```

---

## 📁 Files Modified

### Frontend (3 files)
- `client/src/pages/portal-landing.tsx` - Reads URL params
- `client/src/components/auth/auth-form.tsx` - Silent tracking
- `client/src/pages/affiliate/affiliate/home.tsx` - Link display

### Backend (2 files)
- `server/supabaseAuth.ts` - Accepts tracking fields
- `server/storage.ts` - Stores tracking data

### Database
- `shared/schema.ts` - Updated schema
- `migrations/0011_add_lead_tracking.sql` - Migration

---

## ✅ Pre-Deployment Checklist

Before going live:

```
[ ] Run migration: migrations/0011_add_lead_tracking.sql
[ ] Test signup with ?affiliate=AFIX001
[ ] Test signup with ?utm_source=blog
[ ] Verify affiliate dashboard shows link
[ ] Test copy link button
[ ] Check database for tracking_source column
[ ] Check database for tracking_campaign column
[ ] Verify new leads have tracking data
[ ] Test in staging environment
[ ] Deploy to production
[ ] Monitor logs for errors
[ ] Verify affiliate can see new link
[ ] Test end-to-end with real affiliate
```

---

## 🔍 How to Verify It's Working

### Check 1: Database Migration
```sql
-- Connect to your database
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'leads';

-- Should see:
-- - tracking_source
-- - tracking_campaign
```

### Check 2: Lead Created with Tracking
```sql
SELECT * FROM leads 
WHERE created_at > NOW() - INTERVAL '1 day'
LIMIT 1;

-- Should see tracking_source and tracking_campaign populated
```

### Check 3: Affiliate Dashboard
1. Log in as affiliate
2. Look for section "Your Affiliate Link"
3. Should show: territorialtutoring.co.za?affiliate=AFIX001
4. Click [Copy Link]
5. Should copy to clipboard

### Check 4: Browser Console
1. Visit: territorialtutoring.co.za?affiliate=AFIX001
2. Click Get Started
3. Open browser console (F12)
4. Submit signup form
5. Should see: `📤 Sending signup body: { ... affiliate_code: "AFIX001", tracking_source: "organic" ... }`

---

## 🎯 The Magic Happens Here

### Portal Landing Page
```javascript
// Reads URL param silently
const affiliateCode = new URLSearchParams(window.location.search).get('affiliate');

// Builds signup URL preserving the param
const signupUrl = `/client/signup?affiliate=${affiliateCode}`;

// User clicks Get Started → goes to signup with code attached
```

### Signup Form
```javascript
// Reads param again (redundant but safe)
const urlCode = new URLSearchParams(window.location.search).get('affiliate');

// Stores it but doesn't show it
const [code, setCode] = useState(urlCode);

// When user submits, code goes to backend silently
// User never sees the code field
```

### Backend
```typescript
// Receives signup with code and tracking params
const { affiliate_code, tracking_source, tracking_campaign } = req.body;

// Creates lead with all tracking data
await storage.createLead(affiliateId, userId, encounterId, {
  trackingSource: tracking_source,
  trackingCampaign: tracking_campaign
});

// Database now has complete tracking info
```

---

## 🚨 If Something Breaks

### Issue: Affiliate link shows wrong code
- Check affiliate dashboard
- Verify code in database: `SELECT code FROM affiliate_codes WHERE affiliate_id = '...'`
- Verify link construction in home.tsx

### Issue: Tracking data not saving
- Check migration ran: `SELECT column_name FROM information_schema.columns WHERE table_name = 'leads'`
- Check backend logs for errors
- Verify createLead function called with tracking data

### Issue: Code field showing in signup
- Check portal-landing.tsx buildSignupUrl() includes params
- Check auth-form.tsx URL param reading
- Verify URL in browser has ?affiliate=... in it

### Issue: Affiliate dashboard not showing link
- Check home.tsx renders handleCopyLink section
- Verify codeData is loading
- Check if code field is appearing instead

---

## 📊 Future Analytics Dashboard

Once you want to add reporting, you can query:

```sql
-- Leads by source
SELECT tracking_source, COUNT(*) as count
FROM leads
GROUP BY tracking_source;

-- Affiliate performance
SELECT a.email, COUNT(l.id) as leads_count
FROM affiliate_codes ac
JOIN users a ON ac.affiliate_id = a.id
LEFT JOIN leads l ON ac.affiliate_id = l.affiliate_id
GROUP BY a.id
ORDER BY leads_count DESC;

-- Campaign performance
SELECT tracking_campaign, COUNT(*) as signups
FROM leads
WHERE tracking_campaign IS NOT NULL
GROUP BY tracking_campaign
ORDER BY signups DESC;

-- Conversion by source
SELECT 
  tracking_source,
  COUNT(DISTINCT l.user_id) as leads,
  COUNT(DISTINCT pe.user_id) as enrolled,
  ROUND(100.0 * COUNT(DISTINCT pe.user_id) / COUNT(DISTINCT l.user_id), 1) as conversion_rate
FROM leads l
LEFT JOIN parent_enrollments pe ON l.user_id = pe.user_id
GROUP BY tracking_source;
```

---

## 🎓 Key Concepts

### Silent Tracking
- User doesn't see code in form
- System reads from URL parameter
- Zero confusion, clean UX

### Branded Domain
- All links use territorialtutoring.co.za
- Not poddigitizer.com
- Better credibility

### Flexible Sources
- Works for affiliates (personal referrals)
- Works for blog/SEO traffic
- Works for partnerships
- Works for media mentions

### Backward Compatible
- Old signup method still works
- New tracking is optional
- No breaking changes

---

## 💡 Next Level (Not Implemented Yet)

If you want to add these later:

1. **Custom landing pages per affiliate**
   - John gets: territorialtutoring.co.za/john-referral
   - Sarah gets: territorialtutoring.co.za/sarah-tutoring

2. **Advanced attribution**
   - Track which blog post drove signup
   - Track which social platform worked best
   - Track multi-touch attribution

3. **Affiliate performance dashboard**
   - Show each affiliate their stats
   - Show commission earned
   - Show conversion rates

4. **A/B testing**
   - Different landing pages per source
   - Different messaging per affiliate
   - Track which resonates best

---

## 🎉 You're Done!

Everything is implemented. Just need to:
1. Run the migration
2. Deploy the code
3. Test the flow
4. Announce to affiliates

The system handles the rest automatically! 

