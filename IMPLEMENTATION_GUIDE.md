# TT Confidence Hub - 4 Portal Architecture Implementation Guide

## 🎯 Project Vision

Transform the TT Confidence Hub into a fully integrated multi-portal ecosystem supporting:
- **Client Portal** - Parents and students
- **Operational Portal** - Tutors and Territory Directors
- **Affiliate Portal** - Affiliates and Outreach Directors
- **Executive Portal** - COO, HR, and CEO (private)

---

## ✅ What's Complete (Frontend)

### 1. **Role System Enhanced** ✓
- Expanded from 3 roles (tutor, td, coo) to 9 roles
- Created shared type definitions: `Role`, `Portal`
- **File:** `shared/portals.ts`

### 2. **Portal Architecture** ✓
- 4 strategic portals with clear separation of concerns
- Portal configuration with metadata
- Role-to-portal mapping
- Navigation structure per role
- **File:** `shared/portals.ts`

### 3. **Directory Structure** ✓
```
client/src/pages/
  ├── client/
  │   ├── parent/dashboard.tsx
  │   └── student/dashboard.tsx
  ├── operational/
  │   ├── tutor/dashboard.tsx
  │   └── td/dashboard.tsx
  ├── affiliate/
  │   ├── affiliate/home.tsx
  │   └── od/dashboard.tsx
  └── executive/
      ├── coo/dashboard.tsx
      ├── hr/dashboard.tsx
      └── ceo/dashboard.tsx
```

### 4. **Access Control** ✓
- `PortalGuard` - Generic portal access validator
- `ExecutivePortalGuard` - Executive-only access control
- Route-level permission checking
- **File:** `client/src/lib/portalGuard.tsx`

### 5. **Authentication** ✓
- Updated signup form with 6 public roles (parent, student, tutor, td, affiliate, od)
- Executive roles excluded from public signup
- Role descriptions in signup flow
- **File:** `client/src/components/auth/auth-form.tsx`

### 6. **Landing Page** ✓
- Strategic 3-portal display (Client primary)
- Portal cards with descriptions
- "Get Involved" footer section
- Links to tutor signup and affiliate program
- **File:** `client/src/pages/portal-landing.tsx`

### 7. **Routing** ✓
- All 4 portals with complete route coverage
- Legacy routes preserved for backwards compatibility
- Organized route sections
- **File:** `client/src/App.tsx`

---

## ⏳ What Needs Backend Implementation

### 1. **Database Migration** 🔴
**File:** `migrations/0008_add_new_roles.sql`

```bash
# This migration adds the new roles to PostgreSQL
npm run db:push
```

**What it does:**
- Expands role enum to include: parent, student, affiliate, od, hr, ceo
- Preserves existing tutor, td, coo users

### 2. **Auth Endpoint Updates** 🔴
**File:** `server/routes.ts`

```typescript
// Update POST /api/auth/signup
// Update POST /api/auth/signin
// Use getDefaultDashboardRoute(role) for intelligent redirects
```

**Changes:**
```typescript
import { getDefaultDashboardRoute } from "@shared/portals";

// Before: if (role === "tutor") return "/tutor/pod";
// After:  const redirectUrl = getDefaultDashboardRoute(role);
```

### 3. **Role Validation Middleware** 🔴
**File:** `server/middleware/roleValidator.ts` (new)

```typescript
// requirePortalRole(portal) - validate user can access portal
// requireExecutiveRole - validate user is executive-level
```

**Usage:**
```typescript
router.get(
  "/api/operational/tutors",
  requirePortalRole("operational"),
  handler
);

router.post(
  "/api/executive/pods",
  requireExecutiveRole,
  handler
);
```

### 4. **Type Safety in Backend** 🔴
```typescript
// Import Role type from shared
import type { Role } from "@shared/portals";

// Use in request validation
const { role }: { role: Role } = req.body;
```

---

## 🚀 How to Test

### 1. **Database Migration**
```bash
cd /path/to/PodDigitizer
npm run db:push
```

Verify:
```sql
SELECT * FROM pg_enum WHERE enum_name = 'role';
```

### 2. **Signup Test**
1. Open app at `http://localhost:5173`
2. Click "Get Started"
3. Select each role and verify descriptions load
4. Sign up as "parent" - should redirect to `/client/parent/dashboard`
5. Sign up as "tutor" - should redirect to `/operational/tutor/dashboard`
6. Sign up as "affiliate" - should redirect to `/affiliate/affiliate/home`

### 3. **Portal Landing Test**
```
http://localhost:5173/portals
```
Should show:
- Client Portal card (primary)
- Operational Portal card
- Affiliate Portal card
- "Get Involved" section with tutor/affiliate links
- NO Executive Portal visible

### 4. **Route Access Test**
```bash
# After signing in as tutor, try:
http://localhost:5173/operational/tutor/dashboard    # ✅ Works

# Try accessing TD route as tutor:
http://localhost:5173/operational/td/dashboard       # ⏸ Should redirect to tutor dashboard

# Try accessing executive as non-executive:
http://localhost:5173/executive/coo/dashboard       # ⏸ Should redirect to correct portal
```

---

## 📋 Implementation Checklist

### Frontend (Complete ✅)
- [x] Role enum expanded (9 roles)
- [x] Portal configuration created
- [x] Directory structure set up
- [x] Access control guards implemented
- [x] Auth form updated
- [x] Landing page created
- [x] Route configuration updated
- [x] Type definitions in place

### Backend (Pending ⏳)
- [ ] Database migration applied
- [ ] Auth endpoints updated
- [ ] Role validation middleware created
- [ ] Type imports added
- [ ] Admin role assignment endpoint
- [ ] Backend tested

### Testing (Pending ⏳)
- [ ] Database migration successful
- [ ] Each role signup tested
- [ ] Cross-portal access prevented
- [ ] Executive portal access restricted
- [ ] Old routes still functional
- [ ] Redirect logic verified

---

## 🔗 File References

### Critical Files
| File | Purpose | Status |
|------|---------|--------|
| `shared/portals.ts` | Portal configuration & role mapping | ✅ |
| `shared/schema.ts` | Role enum definition | ✅ |
| `client/src/lib/portalGuard.tsx` | Access control | ✅ |
| `client/src/App.tsx` | Route configuration | ✅ |
| `client/src/pages/portal-landing.tsx` | Main landing | ✅ |
| `migrations/0008_add_new_roles.sql` | DB migration | ⏳ |
| `PORTAL_ARCHITECTURE.md` | Architecture doc | ✅ |
| `BACKEND_INTEGRATION.md` | Backend guide | ✅ |

---

## 🎬 User Journeys

### Parent (New)
```
Landing → "Client Portal" card → /client/parent/dashboard
```

### Become Tutor (New)
```
Landing → Footer "Become a Tutor" → Signup form (role=tutor)
→ POST /api/auth/signup → Redirect to /operational/tutor/dashboard
```

### Affiliate Program (New)
```
Landing → Footer "Affiliate Program" → Signup form (role=affiliate)
→ POST /api/auth/signup → Redirect to /affiliate/affiliate/home
```

### Executive (New)
```
Admin assigns role → User logs in → ExecutivePortalGuard validates
→ Redirect to /executive/{coo|hr|ceo}/dashboard
```

---

## 🔐 Security Features

### Portal Isolation ✓
- Users can only access routes for their portal
- PortalGuard validates on each route
- Unauthorized access redirects to correct portal

### Executive Isolation ✓
- No public signup for executive roles
- Admin-only role assignment
- ExecutivePortalGuard prevents non-executive access

### Type Safety ✓
- Role type from shared schema
- Role validation on auth endpoints
- TypeScript ensures role consistency

---

## 📝 Next Steps

1. **Run Database Migration**
   ```bash
   npm run db:push
   ```

2. **Update Backend Auth**
   - Modify `/api/auth/signup` and `/api/auth/signin`
   - Use `getDefaultDashboardRoute()` for redirects

3. **Add Role Validation**
   - Create middleware
   - Apply to sensitive endpoints

4. **Test Each Role Path**
   - Signup for each public role
   - Verify redirects
   - Test cross-portal access prevention

5. **Admin Panel Setup** (Future)
   - HR dashboard for role assignment
   - COO dashboard for pod creation
   - CEO dashboard for reporting

---

## 📞 Support

### Error Scenarios

**"Role requires admin assignment"**
- Trying to signup as student/td/od/coo/hr/ceo
- These roles are admin-assigned only

**"Redirected to unexpected portal"**
- Unauthorized portal access attempt
- PortalGuard redirected to correct portal

**"Executive portal not accessible"**
- Non-executive user trying to access `/executive/*`
- ExecutivePortalGuard blocked access

---

## 🎓 Architecture Principles

1. **Single Source of Truth**
   - Role definitions in `shared/portals.ts`
   - No hardcoded role logic

2. **Portal Separation**
   - Clear boundaries between portals
   - No mixing of portal UIs

3. **Type Safety**
   - Role type used throughout
   - Compile-time validation

4. **Backwards Compatibility**
   - Old routes still work
   - Legacy pages preserved
   - New routes alongside old ones

---

## 📊 Portal Matrix

| Portal | Roles | Public | Primary Entry | Pages |
|--------|-------|--------|---------------|-------|
| Client | parent, student | ✅ | Landing | 4+4 |
| Operational | tutor, td | ✅ | "Become Tutor" | 5+4 |
| Affiliate | affiliate, od | ✅ | "Affiliate Program" | 3+1 |
| Executive | coo, hr, ceo | ❌ | Admin assign | 4+3+1 |

**Total:** 9 roles, 4 portals, 24 pages

---

**Implementation Date:** November 17, 2025  
**Status:** Frontend complete, Backend integration ready  
**Next Phase:** Database migration & backend auth updates
