# TT Confidence Hub - 4 Portal Architecture

## Overview
The app now supports 4 strategic portals with 9 user roles, each portal having its own entry point, navigation, and access restrictions.

---

## Portal Structure

### 1. **CLIENT PORTAL** (Public - Parent UI Primary)
**URL Base:** `/client/`  
**Roles:** `parent`, `student`  
**Primary Entry:** When user logs in or app opens  
**Access Level:** Public (self-signup)

#### Parent User Interface (`/client/parent/`)
- Dashboard
- Sessions
- Progress
- Updates

#### Student User Interface (`/client/student/`)
- Dashboard
- Growth
- Academic Tracker
- Assignments
- Updates

---

### 2. **OPERATIONAL PORTAL** (Public - Employee)
**URL Base:** `/operational/`  
**Roles:** `tutor`, `td` (Territory Director)  
**Entry Point:** After "Become a Tutor" footer link  
**Access Level:** Public (public signup)

#### Tutor User Interface (`/operational/tutor/`)
- Dashboard (My Pod)
- Growth
- Academic Tracker
- Sessions
- Updates

#### Territory Director Interface (`/operational/td/`)
- Dashboard
- My Pods
- Reports
- Updates

---

### 3. **AFFILIATE PORTAL** (Public - Revenue)
**URL Base:** `/affiliate/`  
**Roles:** `affiliate`, `od` (Outreach Director)  
**Entry Point:** After "Affiliate Program" footer link  
**Access Level:** Public (public signup)

#### Affiliate User Interface (`/affiliate/affiliate/`)
- Home
- Disc & Deli
- Tracking

#### Outreach Director Interface (`/affiliate/od/`)
- Dashboard

---

### 4. **EXECUTIVE PORTAL** (Private - Leadership)
**URL Base:** `/executive/`  
**Roles:** `coo`, `hr`, `ceo`  
**Entry Point:** Direct admin assignment (no public signup)  
**Access Level:** Private (invitation only, verified by ExecutivePortalGuard)

#### Chief Operating Officer (`/executive/coo/`)
- Dashboard
- Tutor Applications
- Pods
- Broadcast

#### Head of Human Resources (`/executive/hr/`)
- Dashboard
- Traffic (Tutor apps & Student enrollments)
- Updates

#### Chief Executive Officer (`/executive/ceo/`)
- Dashboard

---

## User Journey

### New Parent (Client Portal)
1. Land on `/`
2. View portal overview at `/portals`
3. See "Client Portal" primary option
4. Access parent/student dashboards
5. Redirect: `getDefaultDashboardRoute("parent")` → `/client/parent/dashboard`

### Become a Tutor (Operational Portal)
1. Click "Become a Tutor" footer link
2. Navigate to `/signup?role=tutor`
3. Sign up, get redirected to `/operational/tutor/dashboard`

### Affiliate Program (Affiliate Portal)
1. Click "Affiliate Program" footer link
2. Navigate to `/signup?role=affiliate`
3. Sign up, get redirected to `/affiliate/affiliate/home`

### Executive Access (Executive Portal)
1. Admin assigns `coo`, `hr`, or `ceo` role directly (no public signup)
2. User logs in → ExecutivePortalGuard validates role
3. Redirected to `/executive/{coo|hr|ceo}/dashboard`
4. Non-executive users trying to access executive routes get redirected to their assigned portal

---

## Key Files & Architecture

### Role Definition
- **File:** `shared/portals.ts`
- **Contains:**
  - Role type definition (9 roles)
  - PORTAL_CONFIG (portal metadata)
  - ROLE_TO_PORTAL (role → portal mapping)
  - ROLE_NAVIGATION (role → nav items)
  - PUBLIC_ROLES vs ADMIN_ASSIGNED_ROLES

### Routing Guard
- **File:** `client/src/lib/portalGuard.tsx`
- **Components:**
  - `PortalGuard` - Generic portal access validator
  - `ExecutivePortalGuard` - Strict executive-only access
  - `canUserAccessRoute()` - Route-level permission check
  - `getRedirectPathForRole()` - Dynamic redirect logic

### Portal Landing Page
- **File:** `client/src/pages/portal-landing.tsx`
- **Features:**
  - Hero section
  - 3 portal cards (Client, Operational, Affiliate)
  - "Get Involved" section with tutor/affiliate signup links
  - Executive portal hidden from UI (admin-only)

### Auth Flow
- **File:** `client/src/components/auth/auth-form.tsx`
- **Updated:**
  - Role selection shows all 6 public roles (parent, student, tutor, td, affiliate, od)
  - Executive roles (coo, hr, ceo) excluded from signup form
  - Uses `getDefaultDashboardRoute(role)` for post-auth redirect

### Routing Configuration
- **File:** `client/src/App.tsx`
- **Structure:**
  - All 4 portals have dedicated route sections
  - Legacy routes preserved for backwards compatibility
  - Clear section headers for code organization

---

## Access Control Rules

### PortalGuard Logic
```typescript
// User's role must exist in portal's allowed roles
if (!PORTAL_CONFIG[requiredPortal].roles.includes(userRole)) {
  // Redirect to their correct portal
  redirect to PORTAL_CONFIG[userPortal].dashboardRoute
}
```

### ExecutivePortalGuard Logic
```typescript
// Only coo, hr, ceo can access executive routes
if (!["coo", "hr", "ceo"].includes(userRole)) {
  // Redirect to their assigned portal (client, affiliate, or operational)
  redirect to ROLE_TO_PORTAL[role]
}
```

---

## Feature Implementation Notes

### Parent Enrollment Form
- Will use `/client/parent/dashboard` as entry point
- 6-step enrollment process defined in project brief
- QR code/affiliate link integration TBD

### Affiliate QR Codes & Links
- Will be assigned in `/affiliate/affiliate/home`
- Each pod gets unique QR for each affiliate
- Tracking at `/affiliate/affiliate/tracking`

### Pod Creation (COO)
- At `/executive/coo/dashboard`
- Requires 10 approved tutors (HR manages)
- HR assigns tutors at `/executive/hr/dashboard`

### Weekly Check-ins
- Tutor submits at `/operational/tutor/growth`
- TD reviews at `/operational/td/reports`

---

## Migration Path

### Existing Users
- Old tutor routes (`/tutor/*`) still work (legacy)
- New tutor routes (`/operational/tutor/*`) preferred
- Same functionality, just reorganized under portal structure

### Default Login Redirect
- Auth form uses `getDefaultDashboardRoute(role)` for intelligent routing
- No hardcoded redirect logic

---

## Navigation Architecture

Each role has tailored navigation defined in `ROLE_NAVIGATION`:
- Parent: 4 items
- Student: 5 items
- Tutor: 5 items
- TD: 4 items
- Affiliate: 3 items
- OD: 1 item
- COO: 4 items
- HR: 3 items
- CEO: 1 item

Navigation injected into DashboardLayout based on current user's role.

---

## Security Considerations

1. **Executive Portal Isolation**
   - No direct signup possible
   - Only admins can assign coo/hr/ceo roles
   - ExecutivePortalGuard prevents unauthorized access

2. **Portal Separation**
   - Users can only access routes for their assigned portal
   - PortalGuard validates on each route
   - Unauthorized access redirects to correct portal

3. **Role Consistency**
   - Single source of truth: `shared/portals.ts`
   - Schema enum matches portal definitions
   - Type safety via TypeScript

---

## Testing Checklist

- [ ] Parent signup → `/client/parent/dashboard`
- [ ] Student login → `/client/student/dashboard`
- [ ] Tutor signup → `/operational/tutor/dashboard`
- [ ] TD login → `/operational/td/dashboard`
- [ ] Affiliate signup → `/affiliate/affiliate/home`
- [ ] OD login → `/affiliate/od/dashboard`
- [ ] COO login → `/executive/coo/dashboard`
- [ ] HR login → `/executive/hr/dashboard`
- [ ] CEO login → `/executive/ceo/dashboard`
- [ ] Non-executive can't access `/executive/*` routes
- [ ] Portal landing shows 3 portals (not executive)
- [ ] Footer "Get Involved" links work
- [ ] Old routes (`/tutor/*`, `/td/*`, `/coo/*`) still functional
