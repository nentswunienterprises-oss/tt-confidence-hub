# 🧪 Student Portal Testing Checklist

Use this checklist to test the student portal functionality.

## ✅ Pre-Testing Setup

- [ ] Database migration has been run (`node run-student-migration.mjs`)
- [ ] Development server is running (`npm run dev`)
- [ ] You have access to parent and tutor accounts

## 📋 Test Scenarios

### Scenario 1: Parent Code Generation

**Goal**: Verify that accepting a proposal generates a parent code

1. - [ ] Login as a parent who has received a proposal
2. - [ ] Navigate to `/client/parent/gateway`
3. - [ ] View the proposal
4. - [ ] Click "Accept Proposal"
5. - [ ] **VERIFY**: A unique 8-character code is displayed (e.g., "XY3K8NPR")
6. - [ ] **VERIFY**: Code can be copied to clipboard using the copy button
7. - [ ] **VERIFY**: Instructions for sharing with student are shown

### Scenario 2: Student Sign Up with Valid Code

**Goal**: Create a new student account using the parent code

1. - [ ] Navigate to `/student` in a new incognito/private browser window
2. - [ ] **VERIFY**: Sign up form is displayed by default
3. - [ ] Fill in the form:
   - First Name: `Test`
   - Last Name: `Student`
   - Email: `student@test.com`
   - Password: `password123`
   - Confirm Password: `password123`
   - Parent Code: `[PASTE CODE FROM SCENARIO 1]`
4. - [ ] Click "Create Account"
5. - [ ] **VERIFY**: Success message appears
6. - [ ] **VERIFY**: Redirected to `/student/dashboard`
7. - [ ] **VERIFY**: Dashboard shows student's name
8. - [ ] **VERIFY**: Account information is displayed correctly

### Scenario 3: Student Sign Up with Invalid Code

**Goal**: Verify validation works for invalid codes

1. - [ ] Navigate to `/student` in a new incognito/private browser window
2. - [ ] Fill in the sign up form with a random parent code (e.g., "INVALID1")
3. - [ ] Click "Create Account"
4. - [ ] **VERIFY**: Error message: "Invalid parent code"
5. - [ ] **VERIFY**: Account is NOT created

### Scenario 4: Student Sign Up with Used Code

**Goal**: Verify codes can only be used once

1. - [ ] Navigate to `/student` in a new incognito/private browser window
2. - [ ] Try to sign up with the SAME parent code used in Scenario 2
3. - [ ] Click "Create Account"
4. - [ ] **VERIFY**: Error message: "This parent code has already been used"

### Scenario 5: Student Sign In

**Goal**: Verify students can log in after creating an account

1. - [ ] Navigate to `/student`
2. - [ ] Click "Sign In" to switch modes
3. - [ ] **VERIFY**: Sign in form is displayed
4. - [ ] Enter credentials:
   - Email: `student@test.com`
   - Password: `password123`
5. - [ ] Click "Sign In"
6. - [ ] **VERIFY**: Success message appears
7. - [ ] **VERIFY**: Redirected to `/student/dashboard`
8. - [ ] **VERIFY**: Student data is loaded correctly

### Scenario 6: Student Sign In with Wrong Password

**Goal**: Verify authentication security

1. - [ ] Navigate to `/student`
2. - [ ] Switch to "Sign In" mode
3. - [ ] Enter credentials with wrong password:
   - Email: `student@test.com`
   - Password: `wrongpassword`
4. - [ ] Click "Sign In"
5. - [ ] **VERIFY**: Error message: "Invalid credentials"
6. - [ ] **VERIFY**: NOT redirected to dashboard

### Scenario 7: Student Logout

**Goal**: Verify students can log out

1. - [ ] While logged in at `/student/dashboard`
2. - [ ] Click "Log Out" button
3. - [ ] **VERIFY**: Logged out successfully message
4. - [ ] **VERIFY**: Redirected to `/student`
5. - [ ] Try to access `/student/dashboard` directly
6. - [ ] **VERIFY**: Redirected back to `/student` (not authenticated)

### Scenario 8: Session Persistence

**Goal**: Verify student sessions persist across page reloads

1. - [ ] Sign in as a student
2. - [ ] Navigate to `/student/dashboard`
3. - [ ] Refresh the page (F5)
4. - [ ] **VERIFY**: Still logged in
5. - [ ] **VERIFY**: Student data still displayed
6. - [ ] Navigate to another page and back
7. - [ ] **VERIFY**: Session still active

## 🎯 Expected Results Summary

| Test | Expected Result |
|------|----------------|
| Parent accepts proposal | 8-character code generated and displayed |
| Student signs up with valid code | Account created, redirected to dashboard |
| Student signs up with invalid code | Error message, account NOT created |
| Student signs up with used code | Error message about code being used |
| Student signs in with correct credentials | Signed in, redirected to dashboard |
| Student signs in with wrong password | Error message, NOT signed in |
| Student logs out | Session destroyed, redirected to landing |
| Student session persistence | Session persists across page reloads |

## 🐛 Common Issues

### Issue: Parent code not showing after accepting proposal
**Solution**: Check browser console, verify backend API returned the code

### Issue: Student signup fails with valid code
**Solution**: Verify migration ran successfully, check database tables exist

### Issue: Session not persisting
**Solution**: Check that cookies are enabled, verify session middleware is running

### Issue: CORS errors
**Solution**: Ensure using same domain for frontend and backend

## 📊 Testing Complete!

Once all checkboxes are checked ✅, the student portal is working correctly!

**Date Tested**: _______________
**Tested By**: _______________
**Result**: PASS / FAIL
**Notes**: _______________________________________________
