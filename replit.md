# TT Confidence Hub - Replit Configuration

## Overview

TT Confidence Hub is a mobile-first operational platform for Territorial Tutoring's 4-Seater Pod system - a training and certification engine for trial tutors. The application digitizes the complete pod lifecycle from tutor application through training to certification, with distinct role-based interfaces for Tutors, Territory Directors (TDs), and Chief Operations Officers (COOs).

The platform emphasizes confidence-building through warm, personal design language using earth tones and encouraging interactions. It manages tutoring sessions, student progress tracking, academic metrics, and real-time communication between stakeholders.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Critical Bug Fixes and Session Persistence (November 5, 2025 - Session 2)
- **CRITICAL: Fixed TD Dashboard Pod Assignment Bug** - Unified two conflicting systems: auth flow was checking `role_permissions.assigned_pod_id` while COO assigns via `pods.td_id`. Rewrote `checkTDPodAssignment()` to query `pods` table directly.
- **Implemented Persistent Session Storage** - Replaced memorystore with PostgreSQL session storage using connect-pg-simple. Sessions now persist across server restarts, preventing forced logout on code updates.
- **Fixed Tutor Application Date Display** - Handles both snake_case `created_at` and camelCase `createdAt` from database to prevent "Invalid time value" errors.
- **Added Soft Delete for Pods** - Pods can be deleted via UI with automatic TD unassignment. Deleted pods excluded from all queries via `deleted_at` filter.
- **Improved TD Assignment UX** - Prevents duplicate success toasts when reassigning TD to same pod.

### Storage Layer Refactoring (November 5, 2025 - Session 1)
- **Fixed Supabase PostgREST schema cache issues** - All schema changes now properly recognized after running `NOTIFY pgrst, 'reload schema'`
- **Removed manual timestamp handling** - Database auto-generates created_at/updated_at via defaultNow()
- **Fixed table naming consistency** - All queries use snake_case table names matching database schema (tutor_assignments, tutor_applications, role_permissions)
- **Fixed column naming consistency** - All queries use snake_case column names (td_id, user_id, created_at, updated_at, etc.)
- **Removed generic type parameters** - All Supabase client calls now use string table names only for proper TypeScript inference
- **Critical fix**: Pod creation and tutor application submission now work correctly with Supabase PostgREST API

### Database Migration to Supabase (November 2025)
- Successfully migrated entire database from Replit Neon to Supabase PostgreSQL
- Created 12 tables with proper schema definitions and relationships
- Implemented Supabase Auth for authentication (replacing Replit Auth)
- Created database trigger `handle_new_user()` for auto-creating users on signup
- Configured Drizzle ORM to work with Supabase connection

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety and modern component architecture
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing
- Mobile-first responsive design approach

**UI Component System**
- Radix UI primitives for accessible, unstyled component foundation
- shadcn/ui component library (New York style variant) for pre-built, customizable components
- TailwindCSS for utility-first styling with custom design tokens
- Custom color palette based on warm earth tones (#FAF7F2 background, #E67E22 confidence orange accent)
- CSS variables for theming with HSL color format
- Inter font family from Google Fonts

**State Management**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- React hooks for local component state
- Form state handled by React Hook Form with Zod resolvers for validation

**Design System**
- Custom design guidelines emphasizing warmth and confidence-building
- Typography scale from 0.75rem (labels) to 3rem (hero text)
- Semantic color system for success, warning, error, and info states
- Consistent spacing and border radius tokens

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server
- TypeScript for type safety across the stack
- Session-based authentication with express-session
- RESTful API design pattern with `/api` prefix

**Authentication System**
- Supabase Auth integration via @supabase/supabase-js for email/password authentication
- Express session-based authentication with Supabase session validation
- Session storage for persistent login state using memorystore
- Role-based access control (RBAC) with middleware guards
- Three user roles: tutor, td (Territory Director), coo (Chief Operations Officer)

**Database Layer**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the relational database (via Supabase)
- Schema-first approach with Drizzle Zod integration for runtime validation
- Migration management via drizzle-kit

**Database Schema Design**
- `users` table with role-based differentiation (tutor/td/coo)
- `pods` table for training pod management (4-seater and future 6-seater support)
- `tutor_assignments` linking tutors to pods with certification status tracking
- `students` table for learner profiles managed by tutors
- `sessions` table for individual tutoring session records
- `reflections` table for tutor self-assessment after sessions
- `academic_trackers` for student grade and confidence metrics
- `verification_docs` for document upload and approval workflow
- `broadcasts` for system-wide announcements with role-based visibility
- Session storage table for express-session persistence

**API Architecture**
- Route handlers organized by role (tutor, td, coo endpoints)
- Middleware for authentication verification and role-based authorization
- Request validation using Zod schemas derived from Drizzle tables
- Consistent error handling with HTTP status codes
- JSON response format throughout

### Data Storage Solutions

**Primary Database**
- PostgreSQL via Supabase (using @neondatabase/serverless driver for connection pooling)
- Connection pooling for efficient resource usage via Supabase pooler
- DATABASE_URL environment variable points to Supabase PostgreSQL connection string
- Database hosted at: `aws-1-eu-west-1.pooler.supabase.com:6543`

**Session Storage**
- **PostgreSQL persistent session storage** using connect-pg-simple (production-ready)
- Automatic fallback to memorystore if DATABASE_URL unavailable
- Session expiry management with 7-day TTL
- HTTP-only cookies for session tokens (secure flag enabled in production only)
- Sessions persist across server restarts - no forced logout on code updates

**File Storage**
- Design indicates Supabase Storage for agreements and consent forms (not yet implemented in current codebase)
- Future integration point for document management

### Authentication and Authorization

**Authentication Flow**
1. User signs up or logs in with email/password via Supabase Auth
2. Frontend calls backend auth endpoints (/api/auth/signup or /api/auth/signin)
3. Backend validates credentials with Supabase and creates server-side session
4. Session stores user ID, email, and role
5. Subsequent requests validated via session cookie

**Authorization Pattern**
- `isAuthenticated` middleware checks for valid session
- `requireRole(['role1', 'role2'])` middleware validates user roles
- User role stored in database and attached to request object
- Role-specific route protection at API level
- Frontend role checks for conditional UI rendering

**User Management**
- Upsert pattern for user creation/update on login
- User verification status for application approval workflow
- Role assignment and modification by COO

**Role-Based Access Control (Phase 1)**
- Email-based role authorization for TD and COO roles
- Tutor role: Open to all users (default role for new signups)
- TD role: Requires email to be whitelisted in role permissions
- COO role: Restricted to single email `coo@territorialtutoring.com`
- TD without pod assignment redirected to /td/no-pod page
- Role-specific dashboard redirects after authentication

**Development: Assigning Roles for Testing**

To assign TD or COO roles during development, use the `/api/auth/assign-role` endpoint:

```bash
# Assign TD role to an email
curl -X POST https://your-replit-domain.repl.co/api/auth/assign-role \
  -H "Content-Type: application/json" \
  -d '{
    "email": "td.test@example.com",
    "role": "td"
  }'

# Assign TD role with pod assignment
curl -X POST https://your-replit-domain.repl.co/api/auth/assign-role \
  -H "Content-Type: application/json" \
  -d '{
    "email": "td.test@example.com",
    "role": "td",
    "assignedPodId": "pod-123"
  }'
```

**Note:** The COO email `coo@territorialtutoring.com` is pre-configured and cannot be changed without code modification.

**Testing Role-Based Access:**
1. New users default to `tutor` role and redirect to `/tutor/pod`
2. TD users without pod assignment redirect to `/td/no-pod`
3. TD users with pod assignment redirect to `/td/dashboard`
4. COO users redirect to `/coo/dashboard`

### External Dependencies

**Third-Party Services**
- Replit authentication service (OIDC provider)
- Neon Database (serverless PostgreSQL hosting)
- Google Fonts API (Inter font family)

**NPM Packages - Core Functionality**
- `express` - HTTP server framework
- `drizzle-orm` - Database ORM and query builder
- `@neondatabase/serverless` - PostgreSQL driver for Neon
- `react` - UI rendering library
- `@tanstack/react-query` - Server state management
- `wouter` - Client-side routing
- `zod` - Schema validation
- `react-hook-form` - Form state management

**NPM Packages - Authentication**
- `@supabase/supabase-js` - Supabase client for authentication
- `express-session` - Session management
- `memorystore` - In-memory session store

**NPM Packages - UI Components**
- `@radix-ui/*` - Accessible component primitives (30+ packages)
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Component variant management
- `clsx` & `tailwind-merge` - Conditional className utilities
- `cmdk` - Command palette component
- `lucide-react` - Icon library
- `date-fns` - Date manipulation utilities

**Build & Development Tools**
- `vite` - Build tool and dev server
- `typescript` - Type system
- `tsx` - TypeScript execution
- `esbuild` - Production bundler for server code
- `drizzle-kit` - Database migration tool
- `@replit/vite-plugin-*` - Replit-specific development enhancements

**API Integration Pattern**
- Centralized `apiRequest` helper for fetch wrapper
- Query client configuration with automatic JSON parsing
- Error handling with 401 detection for unauthorized state
- Credentials included for session cookie transmission
- Type-safe query keys using array notation