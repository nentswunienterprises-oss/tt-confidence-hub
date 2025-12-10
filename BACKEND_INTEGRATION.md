# Backend Integration Guide - 4 Portal Architecture

## Overview
The backend needs to be updated to support the new 9-role architecture and intelligent routing.

---

## 1. Database Schema Updates

### Already Done (Frontend)
- ✅ `shared/schema.ts` - roleEnum updated to include all 9 roles

### Backend Required
Update `server/db.ts` to ensure PostgreSQL enum matches:

```typescript
// Verify this enum exists in your PostgreSQL database
export const roleEnum = pgEnum("role", [
  "parent",
  "student",
  "tutor",
  "td",
  "affiliate",
  "od",
  "coo",
  "hr",
  "ceo",
]);
```

**Migration Required:**
```sql
-- Add new roles to the role enum type
ALTER TYPE role ADD VALUE 'parent' BEFORE 'tutor';
ALTER TYPE role ADD VALUE 'student' BEFORE 'tutor';
ALTER TYPE role ADD VALUE 'affiliate' AFTER 'td';
ALTER TYPE role ADD VALUE 'od' AFTER 'affiliate';
ALTER TYPE role ADD VALUE 'hr' AFTER 'coo';
ALTER TYPE role ADD VALUE 'ceo' AFTER 'hr';
```

---

## 2. Auth Endpoints Updates

### POST `/api/auth/signup`

**Current:** Accepts role but only validates tutor/td/coo

**Required Change:**
```typescript
// Accept all 6 public signup roles
const publicSignupRoles = ["parent", "tutor", "affiliate"];
const adminAssignedRoles = ["student", "td", "od", "coo", "hr", "ceo"];

// For signup, only allow public roles
if (!publicSignupRoles.includes(role)) {
  throw new Error("Role requires admin assignment");
}

// Then import and use the redirect logic
import { getDefaultDashboardRoute } from "@shared/portals";

const redirectUrl = getDefaultDashboardRoute(role as Role);
// Returns:
// - parent → "/client/parent/dashboard"
// - tutor → "/operational/tutor/dashboard"
// - affiliate → "/affiliate/affiliate/home"
```

### POST `/api/auth/signin`

**Current:** Hardcoded role-based redirects

**Required Change:**
```typescript
// Before: 
// if (user.role === "tutor") return { redirectUrl: "/tutor/pod" }

// After:
import { getDefaultDashboardRoute } from "@shared/portals";
const redirectUrl = getDefaultDashboardRoute(user.role);
return { redirectUrl };
```

---

## 3. Role Validation Middleware

### Create/Update `server/middleware/roleValidator.ts`

```typescript
import { getPortalForRole, canAccessPortal } from "@shared/portals";
import type { Role, Portal } from "@shared/portals";

/**
 * Middleware to validate role can access specific portal
 */
export function requirePortalRole(requiredPortal: Portal) {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userRole = req.user.role as Role;
    if (!canAccessPortal(userRole, requiredPortal)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Role ${userRole} cannot access ${requiredPortal} portal`,
      });
    }

    next();
  };
}

/**
 * Middleware to require executive-only access
 */
export function requireExecutiveRole(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const executiveRoles = ["coo", "hr", "ceo"];
  if (!executiveRoles.includes(req.user.role)) {
    return res.status(403).json({
      error: "Forbidden",
      message: "This endpoint requires executive-level access",
    });
  }

  next();
}
```

### Usage Example
```typescript
// routes.ts

import { requirePortalRole, requireExecutiveRole } from "./middleware/roleValidator";

// Operational Portal routes
router.get(
  "/api/operational/pods",
  requirePortalRole("operational"),
  async (req, res) => {
    // tutor and td can access
  }
);

// Executive Portal routes
router.post(
  "/api/executive/pods",
  requireExecutiveRole,
  async (req, res) => {
    // only coo, hr, ceo can access
  }
);

// Client Portal routes
router.get(
  "/api/client/sessions",
  requirePortalRole("client"),
  async (req, res) => {
    // parent and student can access
  }
);
```

---

## 4. Backend Routes Organization

### Current Structure
```
/api/auth/*              - Auth endpoints
/api/tutor/*            - Tutor-specific
/api/td/*               - TD-specific
/api/coo/*              - COO-specific
```

### Proposed New Structure (Optional Refactor)
```
/api/auth/*             - Auth endpoints (unchanged)
/api/client/*           - Client portal endpoints
  /api/client/parent/*  - Parent endpoints
  /api/client/student/* - Student endpoints
/api/operational/*      - Operational portal endpoints
  /api/operational/tutor/*  - Tutor endpoints
  /api/operational/td/*     - TD endpoints
/api/affiliate/*        - Affiliate portal endpoints
  /api/affiliate/*      - Affiliate endpoints
  /api/affiliate/od/*   - OD endpoints
/api/executive/*        - Executive portal endpoints (protected)
  /api/executive/coo/*  - COO endpoints
  /api/executive/hr/*   - HR endpoints
  /api/executive/ceo/*  - CEO endpoints
```

**Note:** Can keep old routes for backwards compatibility, just add new ones alongside.

---

## 5. Updated Auth Flow

### Current Flow
```
Signup Form → POST /api/auth/signup → Hardcoded redirect (tutor/td/coo)
```

### New Flow
```
Signup Form (6 public roles) → POST /api/auth/signup → Use getDefaultDashboardRoute(role) → Client-side redirect to new portal route
```

### Backend Changes Needed
```typescript
// server/routes.ts (excerpt)

router.post("/api/auth/signup", async (req, res) => {
  const { email, password, role, first_name, last_name } = req.body;

  // Validate role is public signup role
  const publicRoles = ["parent", "tutor", "affiliate"];
  if (!publicRoles.includes(role)) {
    return res.status(400).json({ 
      error: "This role requires admin assignment" 
    });
  }

  // ... existing signup logic ...

  // Generate intelligent redirect
  const { getDefaultDashboardRoute } = await import("@shared/portals");
  const redirectUrl = getDefaultDashboardRoute(role);

  return res.json({ redirectUrl }); // e.g., "/operational/tutor/dashboard"
});

router.post("/api/auth/signin", async (req, res) => {
  const { email, password } = req.body;

  // ... existing login logic ...

  const { getDefaultDashboardRoute } = await import("@shared/portals");
  const redirectUrl = getDefaultDashboardRoute(user.role);

  return res.json({ redirectUrl }); // Intelligent redirect based on role
});
```

---

## 6. Admin Role Assignment (HR)

### New Endpoint Needed: POST `/api/executive/hr/assign-role`

```typescript
router.post(
  "/api/executive/hr/assign-role",
  requireExecutiveRole, // Only HR/COO/CEO
  async (req, res) => {
    const { userId, newRole } = req.body;

    // Only admins can assign restricted roles
    const adminAssignedRoles = ["student", "td", "od", "coo", "hr", "ceo"];
    if (!adminAssignedRoles.includes(newRole)) {
      return res.status(400).json({ 
        error: "Invalid role for admin assignment" 
      });
    }

    // Update user role in database
    const updatedUser = await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.id, userId))
      .returning();

    return res.json({ 
      success: true, 
      user: updatedUser[0],
      message: `User role updated to ${newRole}`
    });
  }
);
```

---

## 7. Type Safety

### Export Role Type from Backend
```typescript
// server/types.ts
export type { Role, Portal } from "@shared/portals";

// Or import directly in routes
import type { Role } from "@shared/portals";

export interface AuthenticatedRequest extends express.Request {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}
```

---

## 8. Testing Checklist

- [ ] Update database migration with new role enum values
- [ ] Test `/api/auth/signup` with each public role (parent, tutor, affiliate)
- [ ] Verify `redirectUrl` returned is correct for each role
- [ ] Test `/api/auth/signin` returns intelligent redirects
- [ ] Test role validation middleware prevents cross-portal access
- [ ] Test `requireExecutiveRole` blocks non-executive users
- [ ] Verify old routes still work (backward compatibility)
- [ ] Test admin role assignment endpoint
- [ ] Verify type safety - Role type used throughout backend

---

## 9. Migration Steps

1. **Database:**
   - Run migration to add new role enum values
   - Backfill any existing users with appropriate roles

2. **Backend:**
   - Update auth endpoints to use `getDefaultDashboardRoute()`
   - Add role validation middleware
   - Create admin assignment endpoint (HR portal)

3. **Frontend:**
   - ✅ Already done - new portal structure in place

4. **Testing:**
   - Sign up as each role, verify correct portal redirect
   - Test cross-portal access prevention
   - Test executive portal isolation

---

## 10. Backwards Compatibility

### Keep These Routes
```
GET /api/tutor/pod         → Still works
GET /api/tutor/reflections → Still works
POST /api/tutor/weekly-check-in → Still works
GET /api/td/tutors         → Still works
POST /api/coo/pods         → Still works
```

### Add Alongside New Routes
```
GET /api/operational/tutor/my-pod
GET /api/operational/tutor/reflections
POST /api/operational/tutor/weekly-check-in
GET /api/operational/td/assignments
POST /api/executive/coo/pods
```

No breaking changes - just new organized structure.

---

## Summary

**Frontend:** ✅ Complete
- Portal config created
- Routes organized by portal
- Guards implemented
- Auth form updated

**Backend:** ⏳ Needs Implementation
1. Update role enum (migration)
2. Use `getDefaultDashboardRoute()` in auth endpoints
3. Add role validation middleware
4. Create admin assignment endpoint
5. Test all role paths

**Priority:** High - Blocks live testing of new portal structure
