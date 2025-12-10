# Parent Onboarding Proposal System - Implementation Summary

## Overview
The proposal system allows tutors to create personalized onboarding proposals for parents, which appear in the parent gateway and remain accessible in their dashboard.

## What Was Built

### 1. Database Schema (shared/schema.ts)
- **`enrollmentStatusEnum`**: Added new enum with status: `proposal_sent`
- **`parentEnrollments` table**: Stores parent enrollment applications with fields for:
  - Parent & student information
  - Enrollment status tracking
  - Tutor assignment
  - Proposal linking
  
- **`onboardingProposals` table**: Stores detailed proposals with:
  - Identity & emotional profile data
  - Academic diagnosis
  - Psychological anchor (Identity Sheet data)
  - Recommended plan & justification
  - View tracking (viewed_at, viewed_count)

### 2. Backend API Routes (server/routes.ts)

#### POST `/api/tutor/proposal`
- **Who**: Tutors, TD, HR, COO, CEO
- **Purpose**: Create and send a proposal to parent
- **Actions**:
  - Saves proposal to `onboarding_proposals` table
  - Updates enrollment status to `proposal_sent`
  - Links proposal to enrollment record

#### GET `/api/proposal/:id`
- **Who**: Parent (owner), Tutor (creator), Admin roles
- **Purpose**: Fetch a specific proposal by ID
- **Actions**:
  - Returns full proposal with tutor and student info
  - Tracks view count when parent views it

#### GET `/api/parent/proposal`
- **Who**: Parents only
- **Purpose**: Get the parent's own proposal
- **Actions**:
  - Finds proposal linked to parent's enrollment
  - Auto-tracks views

### 3. Frontend Components

#### `ParentOnboardingProposal.tsx` (Tutor-facing)
**Updated**: `handleSendProposal()` now:
- Makes POST request to `/api/tutor/proposal`
- Sends all form data to backend
- Closes dialog on success

#### `ProposalView.tsx` (Parent-facing) - NEW
**Location**: `client/src/components/parent/ProposalView.tsx`

A beautiful, read-only component that displays:
- **Header**: Personalized greeting with student name
- **Tutor Introduction**: Profile with bio, email, phone
- **Identity & Emotional Profile**: 
  - Primary identity, math relationship
  - Confidence triggers (green) & killers (red)
  - Pressure response, growth drivers
- **Academic Diagnosis**:
  - Current topics, struggles, gaps
  - Tutor's assessment notes (highlighted)
- **Identity Sheet** (Psychological Anchor):
  - Who they want to be
  - How they want to be remembered
  - Hidden motivations
  - Internal conflict
- **Recommended Plan** (highlighted card):
  - Plan badge (Standard/Premium)
  - Justification
  - "How Your Child Will Win" section (green)
- **Next Steps**: Clear CTA with numbered list

### 4. Parent Gateway Integration

#### `gateway.tsx`
**Updated** to show proposal when status is `proposal_sent`:
- Fetches proposal via `/api/parent/proposal`
- Displays full `<ProposalView>` component
- Shows after tutor assignment
- Status bar includes "Proposal Sent" state

**Flow**:
1. Parent enrolls → `awaiting_assignment`
2. HR assigns tutor → `assigned` (shows tutor profile)
3. Tutor sends proposal → `proposal_sent` (shows full proposal)
4. Parent books session → `session_booked`

### 5. Parent Dashboard

#### `dashboard.tsx`
**Added**:
- Query to fetch proposal
- "Personalized Learning Proposal" card (if proposal exists)
- Shows recommended plan badge
- "View Full Proposal" button
- Dialog with `<ProposalView>` component
- Proposal remains accessible after leaving gateway

### 6. Database Migration

#### `migrations/0015_onboarding_proposals.sql`
- Creates `enrollment_status` enum
- Updates `parent_enrollments` table schema
- Creates `onboarding_proposals` table
- Adds indexes for performance
- Sets up RLS policies:
  - Tutors can create/view their own proposals
  - Parents can view their own proposals
  - Admins (HR, COO, CEO, TD) can view all
- Adds triggers for `updated_at` timestamps

## How It Works

### Tutor Workflow
1. Open student in pod view
2. Click "Send Proposal"
3. Fill out the ParentOnboardingProposal form (auto-populated from Identity Sheet)
4. Click "Send to Parent"
5. Proposal is saved and enrollment status updates to `proposal_sent`

### Parent Workflow

#### In Gateway:
1. Parent logs in → sees gateway
2. After tutor assignment → sees tutor profile
3. After proposal sent → sees full proposal embedded in gateway
4. Can read entire proposal, see recommended plan

#### In Dashboard:
1. After leaving gateway, proposal appears as a card
2. "View Full Proposal" button opens dialog
3. Full proposal accessible anytime

## Design Highlights

### Parent Experience
- **Clean, professional layout** with gradient accents
- **Color-coded sections**: Green for triggers, red for killers
- **Highlighted psychological anchor** with special styling
- **Clear plan recommendation** in bordered primary card
- **Success-focused messaging** ("How Your Child Will Win")
- **Next steps CTA** at bottom

### Data Flow
```
Tutor fills form → POST /api/tutor/proposal
                ↓
    Saves to onboarding_proposals table
                ↓
    Updates enrollment.status = 'proposal_sent'
                ↓
Parent gateway queries → GET /api/parent/proposal
                ↓
    Renders ProposalView component
                ↓
    Tracks view count
```

## To Deploy

1. **Run migration**:
   ```bash
   # Apply migration to database
   psql -d your_database -f migrations/0015_onboarding_proposals.sql
   ```

2. **Restart server** to load new schema types

3. **Test flow**:
   - Tutor creates proposal for student
   - Parent sees it in gateway
   - Parent accesses it from dashboard

## Future Enhancements
- PDF download functionality (handleDownloadProposal)
- Email notification when proposal is sent
- Parent approval/acceptance workflow
- Proposal editing/versioning
- Analytics on proposal view rates
