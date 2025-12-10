# Student Portal Setup Guide

## 🎓 Overview

The student portal allows students to create accounts using a parent code that is generated when their parent accepts a tutoring proposal.

## 🔧 Setup Instructions

### 1. Run the Database Migration

The student authentication system requires new database tables. Run the migration:

```bash
# Make sure your SUPABASE_SERVICE_ROLE_KEY is set in your .env file
node run-student-migration.mjs
```

This will create:
- `parent_code` column in `onboarding_proposals` table
- `student_users` table for student authentication
- Necessary indexes

### 2. Start the Development Server

```bash
npm run dev
```

## 📝 Testing the Student Portal Flow

### Step 1: Create a Parent Enrollment (if not already done)

1. Navigate to `/client/signup` and create a parent account
2. Go to `/client/parent/gateway` to enroll

### Step 2: Send a Proposal to the Parent

**As a Tutor:**
1. Login as a tutor
2. Navigate to tutor dashboard
3. Create and send a proposal to the enrolled parent

### Step 3: Parent Accepts Proposal

1. Login as the parent at `/client/parent/gateway`
2. View the proposal
3. Click "Accept Proposal"
4. **A unique 8-character parent code will be generated and displayed**
5. Copy this code (there's a "Copy Code" button)

### Step 4: Student Creates Account

1. Navigate to `/student` (the student landing page)
2. Click "Create Account" (should be the default view)
3. Fill in:
   - First Name
   - Last Name
   - Email
   - Password
   - Confirm Password
   - **Parent Code** (paste the code from step 3)
4. Click "Create Account"
5. Student will be automatically signed in and redirected to `/student/dashboard`

### Step 5: Student Can Log Out and Back In

1. On the student dashboard, click "Log Out"
2. You'll be redirected to `/student`
3. Click "Sign In"
4. Enter email and password
5. Click "Sign In"
6. You'll be redirected back to `/student/dashboard`

## 🔐 Security Features

- **Parent Code Validation**: Student accounts can only be created with a valid parent code
- **One-Time Use**: Each parent code can only be used once
- **Proposal Acceptance Required**: Parent must accept the proposal before the code can be used
- **Password Hashing**: Student passwords are hashed using bcryptjs
- **Session-Based Auth**: Student authentication uses secure sessions

## 📋 API Endpoints

### Student Authentication

- `POST /api/student/signup` - Create student account with parent code
- `POST /api/student/signin` - Sign in to student account
- `GET /api/student/me` - Get current student user info
- `POST /api/student/logout` - Log out student

### Parent Code Generation

- `POST /api/parent/proposal/accept` - Accept proposal (generates parent code)
- `GET /api/parent/proposal` - Get proposal (includes parent code if accepted)

## 🎯 Key Features

### Parent Code Display (After Proposal Acceptance)

When a parent accepts a proposal:
1. An 8-character alphanumeric code is generated (e.g., "XY3K8NPR")
2. The code is displayed in a prominent card with:
   - Large, easy-to-read font
   - Copy to clipboard button
   - Clear instructions for the parent
   - Explanation of next steps

### Student Landing Page (`/student`)

Features two modes:
1. **Sign Up Mode** (default)
   - Name, email, password fields
   - Parent code input (8 characters)
   - Form validation
   - Clear error messages

2. **Sign In Mode**
   - Email and password only
   - Toggle between modes
   - Session persistence

### Student Dashboard (`/student/dashboard`)

Current features:
- Welcome message
- Account information display
- Logout button
- "Coming Soon" section with planned features

## 🚀 Next Steps for Enhancement

1. Add student-specific content to the dashboard
2. Implement session history viewing
3. Add progress tracking
4. Enable student-tutor messaging
5. Add homework/assignment features

## 🐛 Troubleshooting

### Migration Fails
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set in your `.env` file
- Verify you have the correct Supabase URL
- Ensure you have database admin permissions

### Parent Code Not Showing
- Verify the proposal was accepted successfully
- Check browser console for errors
- Refresh the page to re-fetch the proposal data

### Student Cannot Sign Up
- Verify the parent code is correct (case-sensitive)
- Ensure the proposal was accepted
- Check that the code hasn't been used already
- Verify the migration ran successfully

## 📱 Routes Summary

| Route | Purpose |
|-------|---------|
| `/student` | Student landing/auth page (signup & signin) |
| `/student/dashboard` | Student dashboard (requires auth) |
| `/client/parent/gateway` | Parent enrollment and proposal view |

