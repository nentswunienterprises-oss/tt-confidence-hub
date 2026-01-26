# Affiliate Tracking Links Proposal

## Current System Analysis

### How It Works Now
1. **Affiliate Code Generation**
   - When an affiliate signs up, they get an **affiliate code** (e.g., `AFIX001`)
   - Code stored in `affiliate_codes` table linked to their user ID
   - They share this code with parents they meet

2. **Parent Signup Flow**
   - Parent must enter affiliate code during signup
   - Code is **required** - signup fails without it
   - After signup, system creates a `lead` record linking parent → affiliate
   - Optionally links to an `encounter` if the parent was met in-person first

3. **Tracking**
   - All parent signups are tracked via the affiliate code
   - Affiliates earn commission when their referred students complete sessions
   - Works great for personal referrals (people affiliates physically meet)

### The Problem You Identified
**The current system requires the parent to have an affiliate code**, which:
- Limits signups to people who directly met the affiliate
- Excludes organic/online leads who found TT through marketing
- Excludes media partnerships, school referrals, or other discovery channels
- **Creates artificial friction** for potential customers

---

## The Solution: Tracking Links

### Concept
Instead of (or in addition to) requiring affiliate codes, create **unique URLs/links** that affiliates can share:

```
https://poddigitizer.com/client/signup?affiliate=AFIX001
https://poddigitizer.com/client/signup?ref=john-doe-affiliate
https://poddigitizer.com/client/signup?utm_source=affiliate&utm_medium=referral&utm_campaign=john_doe
```

### Key Advantages

| Aspect | Current (Code) | With Links |
|--------|---|---|
| **Discovery** | Code-based only | Links + codes (flexible) |
| **Signup Flow** | Affiliate code required | Optional, auto-detected from URL |
| **Tracking** | Manual code entry | Automatic via URL parameter |
| **User Experience** | Friction (must remember/enter code) | Seamless (click link, sign up) |
| **Lead Quality** | Only direct referrals | Direct + organic + partnerships |
| **Mobile Friendly** | Not ideal | Perfect (one-click) |

---

## Technical Implementation Options

### Option 1: Simple URL Parameter (Recommended)
**Easiest to implement, most flexible**

```typescript
// Signup page reads URL parameter
const urlParams = new URLSearchParams(window.location.search);
const affiliateCode = urlParams.get('affiliate'); // e.g., "AFIX001"

// Auto-populate form if code found
if (affiliateCode) {
  setCode(affiliateCode);
  // Optionally: skip code validation, auto-proceed
}
```

**Pros:**
- Minimal code changes
- Works with existing affiliate code system
- Can still require code or make optional
- Easy to test and debug
- SEO-friendly URLs

**Cons:**
- Affiliate codes visible in URL
- Users can easily modify/share wrong code

---

### Option 2: Tracking Link Tokens
**More sophisticated, better for brand partnerships**

Create a new `affiliate_links` table:

```typescript
export const affiliateLinks = pgTable("affiliate_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id")
    .notNull()
    .references(() => users.id),
  linkToken: varchar("link_token").notNull().unique(), // Short random token
  displayName: varchar("display_name"), // "John's Tutoring Referral" 
  campaign: varchar("campaign"), // "summer_2024", "school_partnership", etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Usage:**
```
https://poddigitizer.com/client/signup?link=abc123xyz
https://poddigitizer.com/signup/referral/abc123xyz (cleaner)
```

**Pros:**
- Codes hidden from URL
- Can have multiple links per affiliate (campaigns)
- Links can be revoked/suspended
- Better for brand partnerships
- Cleaner, shorter URLs

**Cons:**
- More database lookups
- Need additional UI for affiliates to generate links

---

### Option 3: Hybrid Approach (Best)
**Combine both for maximum flexibility**

```typescript
// Signup page logic
const urlParams = new URLSearchParams(window.location.search);

// Check for link token first (highest priority)
const linkToken = urlParams.get('link');

// Check for direct code second
const directCode = urlParams.get('affiliate');

// Resolve which affiliate
if (linkToken) {
  const affiliateId = await resolveAffiliateFromLink(linkToken);
  setAffiliate(affiliateId);
  setRequireCodeEntry(false); // Auto-apply, no manual entry needed
} else if (directCode) {
  setCode(directCode);
  setRequireCodeEntry(false); // Auto-apply
} else {
  setRequireCodeEntry(true); // User must enter manually
}
```

This gives you:
- ✅ Links for easy sharing (primary)
- ✅ Codes for in-person meetings (secondary)
- ✅ Manual entry for edge cases

---

## Implementation Steps

### Phase 1: Make Codes Optional (Week 1)
1. Modify signup validation to make affiliate code **optional**
   - Change: `if (mode === "signup" && role === "parent" && !code.trim())`
   - To: Allow signup without code (create lead without affiliate)
   
2. Add URL parameter reading
   ```typescript
   const affiliateCode = new URLSearchParams(window.location.search).get('affiliate');
   if (affiliateCode) {
     setCode(affiliateCode); // Auto-fill
   }
   ```

3. Test: Signup works with and without code

### Phase 2: Tracking Links (Week 2)
1. Create `affiliate_links` table (migration)
2. Add API endpoints:
   - `POST /api/affiliate/links` - Create tracking link
   - `GET /api/affiliate/links` - List affiliate's links
   - `DELETE /api/affiliate/links/:id` - Revoke link

3. Update dashboard for affiliates to generate/manage links

4. Add `?link=xyz` URL parameter resolution in signup

### Phase 3: Enhanced Tracking (Week 3)
1. Add `trackingSource` column to `leads` table:
   ```typescript
   trackingSource: varchar("tracking_source"), // "code", "link", "organic", "manual"
   trackingDetail: varchar("tracking_detail"), // Which code/link/campaign
   ```

2. Log which method was used for analytics
3. Generate reports: "How many signups per affiliate, per method?"

---

## Database Schema Changes

### Minimal (Option 1 - Just URL params):
No schema changes needed! Just frontend logic.

### Medium (Option 2 - Tracking links):
```sql
CREATE TABLE affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES auth.users(id),
  link_token VARCHAR(20) NOT NULL UNIQUE,
  display_name VARCHAR(255),
  campaign VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add tracking source to leads table
ALTER TABLE leads ADD COLUMN tracking_source VARCHAR(50); -- "code", "link", "organic"
ALTER TABLE leads ADD COLUMN tracking_detail VARCHAR(255); -- Which one
```

---

## Example Scenarios

### Scenario 1: In-Person Meeting (Current)
```
Affiliate meets parent → Gives code "AFIX001" 
Parent signs up with code
✅ Tracked correctly
```

### Scenario 2: Online Discovery (NEW)
```
Parent searches "math tutoring" → Finds TT website
Sees affiliates page → "Refer a friend and earn!"
Clicks affiliate's link: poddigitizer.com/signup?link=abc123xyz
Affiliate auto-applied, signup seamless
✅ Tracked automatically
```

### Scenario 3: School Partnership (NEW)
```
School recommends TT to parents
Parents get link: poddigitizer.com/signup?affiliate=SCHOOL_PARTNER
OR unique link: poddigitizer.com/signup?link=school-abc
Signup flow seamless
✅ All attributed to partnership/affiliate
```

### Scenario 4: Media/Brand Channel (NEW)
```
Website blog → "Student Success Stories" → "Enroll with us" button
Button links to: poddigitizer.com/signup?link=blog-feature
Lead tracked separately from personal affiliates
✅ Can measure marketing channel effectiveness
```

---

## Impact Analysis

### Benefits
- 🚀 **Remove friction** - No code entry needed for link clickers
- 📈 **Increase conversions** - Easier signup = more leads
- 🎯 **Track more sources** - Links for marketing, partnerships, organic
- 📊 **Better analytics** - Know which discovery methods work
- 💰 **More commissions** - Affiliates earn from organic traffic they direct
- 🔗 **Flexible attribution** - Supports multiple business models

### Risks
- 📱 URL parameter exposure - Use tokens instead if sensitive
- 🔄 Existing codes still required - Gradual deprecation needed
- 📊 Data migration - Old vs new tracking method reporting

### Mitigation
- Start with optional codes (no breaking changes)
- Provide both methods simultaneously for 6 months
- Clear docs on when to use codes vs links
- Analytics dashboard shows both tracking methods

---

## Quick Wins (Can Ship This Week)

1. **Make codes optional** - `20 mins`
   - Change signup validation to allow empty code
   - Create default "organic" lead type

2. **Add URL parameter** - `30 mins`
   - Read `?affiliate=AFIX001` from URL
   - Auto-fill code field
   - Test with a real affiliate code

3. **Mobile signup optimization** - `1 hour`
   - Fix affiliate code input on mobile
   - Make shareable link prominent on affiliate dashboard
   - Test on iOS/Android

This gives you **immediate value** with minimal risk.

---

## Recommendation

**Ship Option 1 immediately** (URL parameters + optional codes):
- **Dev time:** 1-2 hours
- **Risk:** Minimal
- **Value:** High

Then plan **Option 2** (tracking links) for v2 if needed.

The hybrid approach (Option 3) gives you the best of everything but requires more thoughtful design.

---

## Questions to Answer

1. **Should codes remain required for parents?**
   - Option A: Optional (anyone can signup, may lose tracking)
   - Option B: Required for direct signup, only optional for link (recommended)

2. **Brand concerns with visible codes in URL?**
   - If yes → Use tokens instead
   - If no → Direct codes in URL is fine

3. **Affiliate dashboard complexity?**
   - Simple: Just URL parameter, no new UI
   - Medium: Dashboard to generate/manage links
   - Complex: Full campaign management

4. **What's the primary use case?**
   - A) Personal affiliate codes
   - B) School/brand partnerships
   - C) Organic/marketing channels
   - D) All of the above (use hybrid)

