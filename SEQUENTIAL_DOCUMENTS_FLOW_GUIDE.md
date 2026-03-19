# Sequential Document Submission - Complete Flow Guide

## 🎯 Overview
After a tutor's application is **approved**, they enter a 5-step sequential document submission process. Each document must be completed, submitted, and approved by the COO before moving to the next.

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TUTOR APPLICATION APPROVED                    │
│                                                                   │
│              Status: "approved"                                   │
│              documentSubmissionStep: 0                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│             DOCUMENT SUBMISSION BEGINS (Step 1/5)                 │
│                                                                   │
│  Tutor in Gateway sees:                                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Document 1/5: Tutor Agreement                              │ │
│  │ Status: Not Started                                        │ │
│  │ [ Download Template ] [ Upload Signed Document ]          │ │
│  │                                                             │ │
│  │ All Documents:                                             │ │
│  │ 1. Tutor Agreement ..................... ○ Not Started     │ │
│  │ 2. Code of Conduct ..................... ○ Not Started     │ │
│  │ 3. Emergency Contact & Liability ....... ○ Not Started     │ │
│  │ 4. Background Check Auth ............... ○ Not Started     │ │
│  │ 5. Tax Information ..................... ○ Not Started     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Tutor Actions:                                                   │
│  1. Click "Download Template" → PDF downloads                    │
│  2. Open PDF, read, sign, scan                                   │
│  3. Click "Upload Signed Document" → file selected               │
│  4. System uploads to storage                                     │
│  5. Status changes to "Pending Review" (⏱ Clock icon)            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            COO REVIEWS DOCUMENT (In Applications)                 │
│                                                                   │
│  COO sees in "Verification" tab:                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Pending Review: Tutor Agreement (Step 1/5)                 │ │
│  │                                                             │ │
│  │ [View uploaded PDF/Image] ──→ Opens in new tab             │ │
│  │                                                             │ │
│  │ Tutor: John Doe                                            │ │
│  │ Document: Signed agreement scanned                         │ │
│  │                                                             │ │
│  │ [ ✓ Approve Document ]  [ Reject & Ask for Changes ]      │ │
│  │                                                             │ │
│  │ If rejecting, explain why:                                 │ │
│  │ [Signature is illegible on page 2, please re-scan]        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  COO Actions:                                                     │
│  Option A: Approve                                               │
│  - Click "Approve Document"                                      │
│  - System: Advances tutor to Step 2                              │
│  - Status: verification, documentSubmissionStep: 2               │
│                                                                   │
│  Option B: Reject  
│  - Click "Reject & Ask for Changes"                              │
│  - Enter reason/notes                                            │
│  - Click "Send Back to Tutor"                                    │
│  - Tutor sees rejection reason and can re-upload                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         APPROVED → ADVANCE TO NEXT DOCUMENT (Step 2)             │
│                                                                   │
│  If approved: Tutor gateway now shows:                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Document 2/5: Code of Conduct                              │ │
│  │ Status: Ready to Upload                                    │ │
│  │                                                             │ │
│  │ All Documents:                                             │ │
│  │ 1. Tutor Agreement ..................... ✓ Approved        │ │
│  │ 2. Code of Conduct ..................... ○ Ready to Upload │ │
│  │ 3. Emergency Contact & Liability ....... ○ Not Started     │ │
│  │ 4. Background Check Auth ............... ○ Not Started     │ │
│  │ 5. Tax Information ..................... ○ Not Started     │ │
│  │ Progress: 1/5 documents complete                           │ │
│  │ [ ████░░░░░░░░░░░░░░ ] 20%                               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Tutor repeats: download → sign → upload → wait for approval     │
└─────────────────────────────────────────────────────────────────┘
                      ↓ (repeat 3 more times)
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Emergency Contact & Liability (COO approves)            │
│  STEP 4: Background Check Authorization (COO approves)           │
│  STEP 5: Tax Information (COO approves) ← FINAL DOCUMENT         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         ALL DOCUMENTS APPROVED & VERIFIED (Step 5) ✓             │
│                                                                   │
│  Tutor sees in Gateway:                                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ✓ All Documents Verified                                   │ │
│  │                                                             │ │
│  │ Excellent! All 5 documents have been approved.             │ │
│  │ You're now waiting for pod assignment.                     │ │
│  │                                                             │ │
│  │ ✓ 1. Tutor Agreement ..................... Approved        │ │
│  │ ✓ 2. Code of Conduct ..................... Approved        │ │
│  │ ✓ 3. Emergency Contact & Liability ....... Approved        │ │
│  │ ✓ 4. Background Check Auth ............... Approved        │ │
│  │ ✓ 5. Tax Information ..................... Approved        │ │
│  │                                                             │ │
│  │ [ ████████████████████████████████████ ] 100%             │ │
│  │                                                             │ │
│  │ Next: Awaiting Pod Assignment                              │ │
│  │ You'll be notified when students are assigned to you.      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Database:                                                        │
│  - Status: "confirmed"                                           │
│  - documentSubmissionStep: 5                                     │
│  - documentsStatus: all 5 = "approved"                           │
│  - Ready for pod assignment algorithm                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              POD ASSIGNMENT & ONBOARDING                          │
│              (Handled by pod assignment system)                   │
│                                                                   │
│  - TD/COO can now assign tutor to pods
│  - Tutor receives student introductions
│  - Tutoring sessions begin
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Rejection Flow (What Happens When COO Rejects)

```
Tutor uploads Document 2: Code of Conduct
                  ↓
COO sees in review: "Code of Conduct - Pending Review"
                  ↓
COO clicks "Reject & Ask for Changes"
COO enters: "Page 1 is missing your signature. Please sign and resubmit."
                  ↓
Backend Updates:
- documentsStatus["2"] = "rejected"
- doc_2_code_of_conduct_rejection_reason = "Page 1 is missing..."
                  ↓
Tutor sees in Gateway:
┌────────────────────────────────────┐
│ Document 2/5: Code of Conduct      │
│ Status: Rejected - Please Resubmit │
│                                    │
│ Revisions Needed:                  │
│ "Page 1 is missing your signature. │
│  Please sign and resubmit."        │
│                                    │
│ [ Download Template ] [ Upload ]   │
└────────────────────────────────────┘
                  ↓
Tutor:
1. Downloads template again
2. Reads revision notes
3. Re-scans/prepares new version
4. Uploads corrected document
                  ↓
documentsStatus["2"] = "pending_review" (status changed back)
                  ↓
COO sees again and can approve this time
```

---

## 📱 User Interface Screens

### TUTOR VIEW - Gateway (Not Started)
```
╔════════════════════════════════════════╗
║ Document 1/5                    ⏳      ║
║ Tutor Agreement                        ║
║ Foundation tutoring agreement &        ║
║ policies                               ║
╠════════════════════════════════════════╣
║                                        ║
║ Status: Ready to Upload                ║
║ ─────────────────────────────────────  ║
║                                        ║
║ Please review and sign this tutoring   ║
║ agreement which outlines your          ║
║ responsibilities, payment terms, and   ║
║ conduct standards.                     ║
║                                        ║
║ [ ⬇️ Download Template ]               ║
║ [ ⬆️ Upload Signed Document ]          ║
║                                        ║
╠════════════════════════════════════════╣
║ All Documents                          ║
║                                        ║
║ 1. Tutor Agreement ................ ○  ║
║ 2. Code of Conduct ................ ○  ║
║ 3. Emergency Contact & Liability ... ○  ║
║ 4. Background Check Auth .......... ○  ║
║ 5. Tax Information ................ ○  ║
║                                        ║
║ Progress: 0/5 complete               ║
║ [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0% ║
╚════════════════════════════════════════╝
```

### TUTOR VIEW - Gateway (Pending Review)
```
╔════════════════════════════════════════╗
║ Document 1/5                    ⏳      ║
║ Tutor Agreement                        ║
║ Foundation tutoring agreement &        ║
║ policies                               ║
╠════════════════════════════════════════╣
║ Status: Pending Review                 ║
║ ┌──────────────────────────────────┐   ║
║ │ ⏱️  Your document has been        │   ║
║ │    submitted. We're reviewing     │   ║
║ │    it now.                        │   ║
║ └──────────────────────────────────┘   ║
║                                        ║
║ Waiting for COO approval...            ║
║                                        ║
╠════════════════════════════════════════╣
║ All Documents                          ║
║                                        ║
║ 1. Tutor Agreement ................ ⏱️  ║
║ 2. Code of Conduct ................ ○  ║
║ 3. Emergency Contact & Liability ... ○  ║
║ 4. Background Check Auth .......... ○  ║
║ 5. Tax Information ................ ○  ║
╚════════════════════════════════════════╝
```

### TUTOR VIEW - Gateway (Approved with Rejection)
```
╔════════════════════════════════════════╗
║ Document 2/5                    ✗      ║
║ Code of Conduct                        ║
║ Professional standards &                ║
║ expectations                           ║
╠════════════════════════════════════════╣
║ Status: Rejected - Please Resubmit     ║
║                                        ║
║ ┌──────────────────────────────────┐   ║
║ │ Revisions Needed:                │   ║
║ │ Page 1 is missing your signature.│   ║
║ │ Please sign and resubmit.        │   ║
║ └──────────────────────────────────┘   ║
║                                        ║
║ [ ⬇️ Download Template ]               ║
║ [ ⬆️ Upload Signed Document ]          ║
║                                        ║
╠════════════════════════════════════════╣
║ All Documents                          ║
║                                        ║
║ 1. Tutor Agreement ................ ✓   ║
║ 2. Code of Conduct ................ ✗   ║
║ 3. Emergency Contact & Liability ... ○  ║
║ 4. Background Check Auth .......... ○  ║
║ 5. Tax Information ................ ○  ║
║                                        ║
║ Progress: 1/5 complete                ║
║ [████░░░░░░░░░░░░░░░░░░░░░░░░░░] 20% ║
╚════════════════════════════════════════╝
```

### TUTOR VIEW - Gateway (All Complete)
```
╔════════════════════════════════════════╗
║ ✓ All Documents Verified               ║
║                                        ║
║ Excellent! All 5 documents have been   ║
║ approved. You're now waiting for pod   ║
║ assignment.                            ║
║                                        ║
║ ✓ 1. Tutor Agreement ....... Approved  ║
║ ✓ 2. Code of Conduct ....... Approved  ║
║ ✓ 3. Emergency & Liability .. Approved ║
║ ✓ 4. Background Check ...... Approved  ║
║ ✓ 5. Tax Information ....... Approved  ║
║                                        ║
║ Progress: 5/5 complete                ║
║ [████████████████████████████████] 100%║
║                                        ║
║ Next: Awaiting Pod Assignment          ║
║ You'll be notified when students are   ║
║ assigned to you.                       ║
╚════════════════════════════════════════╝
```

### COO VIEW - Applications (Verification Tab)
```
╔════════════════════════════════════════╗
║ Tutor Applications / Verification       ║
╠════════════════════════════════════════╣
║                                        ║
║ Pending Review: Code of Conduct (2/5)  ║
║ ─────────────────────────────────────  ║
║                                        ║
║ Tutor: Sarah Johnson                   ║
║                                        ║
║ Current Document: Code of Conduct      ║
║ [ℹ️ Document Information]               ║
║                                        ║
║ [📄 View Full Document →]              ║
║    (opens PDF in new tab)              ║
║                                        ║
║ ─────────────────────────────────────  ║
║                                        ║
║ [ ✓ Approve Document ]                ║
║ [ ✗ Reject & Ask for Changes ]        ║
║                                        ║
║ ℹ️  Approving moves the tutor to step 3║
║                                        ║
║ ─────────────────────────────────────  ║
║                                        ║
║ Progress: Document 2 of 5              ║
║ [████░░░░░░░░░░░░░░░░░░░░░░░░░░] 20% ║
╚════════════════════════════════════════╝
```

### COO VIEW - Rejection Dialog
```
╔════════════════════════════════════════╗
║ Return Document for Revision            ║
╠════════════════════════════════════════╣
║                                        ║
║ Explain what needs to be corrected:    ║
║                                        ║
║ ┌──────────────────────────────────┐   ║
║ │ Page 2 is missing signature date.│   ║
║ │ Please add date next to your      │   ║
║ │ signature and resubmit.           │   ║
║ └──────────────────────────────────┘   ║
║                                        ║
║ [ Cancel ]  [ Send Back to Tutor ]    ║
╚════════════════════════════════════════╝
```

---

## 🗃️ Database Status Tracking

### Column: `documents_status` (JSON)
```json
{
  "1": "approved",           // approved ✓
  "2": "pending_review",     // waiting for COO ⏱️
  "3": "rejected",           // rejected, awaiting resubmit ✗
  "4": "pending_upload",     // ready for tutor to upload
  "5": "not_started"         // tutor hasn't started yet ○
}
```

### Column: `document_submission_step`
```
0 - Not started (just got approved, show "Ready to begin" message)
1 - Working on document 1
2 - Working on document 2  
3 - Working on document 3
4 - Working on document 4
5 - All documents complete, ready for pod assignment
```

---

## 🔐 Security & Privacy

- ✓ Documents stored in Supabase Storage (encrypted at rest)
- ✓ RLS policies ensure tutors can only access their own documents
- ✓ COO role required to view all documents
- ✓ Signed URLs expire after 7 days
- ✓ File validation (type & size) on both client & server
- ✓ No sensitive data in logs/alerts
- ✓ Tax information should be encrypted if collected online

---

## 📊 Status Reporting & Analytics

Track completion metrics:
- % of approved tutors who start documents
- % of documents submitted by timeframe  
- Avg time per document review
- Most common rejection reasons
- Tutors with pending reviews (reminder system)

---

## 🚀 Tips for Success

1. **Set Clear Expectations**
   - Tell tutors upfront there are 5 sequential documents
   - Estimate time for each (e.g., 10-15 min per document)
   - Send welcome email with overview

2. **Make Templates Clear**
   - Use professional PDF templates
   - Highlight required fields
   - Provide examples where helpful
   - Include submission deadline

3. **Fast COO Review**
   - Set up notification when document uploaded
   - COO should review within 24 hours
   - Rejection reasons should be specific/actionable
   - Consider auto-reminder if pending >48hr

4. **Support & Communication**
   - Show rejection reasons prominently in UI
   - Allow tutors to message about rejections
   - Have fallback contact (email/phone) if system issues

5. **Prevent Bottlenecks**
   - Email tutors when document approved + moved to next
   - Email COO when new document ready to review
   - Track how long documents stay pending
   - Flag if same document rejected 3+ times
