# Sequential Document Submission - Implementation Checklist

## ✅ Completed Components

### 1. Database Schema & Migration
- ✅ Created migration file: `migrations/0021_tutor_sequential_documents.sql`
- ✅ Updated `shared/schema.ts` with new columns:
  - `documentSubmissionStep` (0-5)
  - `documentsStatus` (JSON tracking)
  - 5 document pairs (url, verified, verifiedBy, verifiedAt, rejectionReason for each)

### 2. Frontend Components  
- ✅ `client/src/components/tutor/SequentialDocumentSubmission.tsx`
  - Shows current document in sequence
  - Download, upload, and track status
  - Progress indicator (e.g., 2/5 complete)
  - List of all 5 documents with status badges
  - Handles file validation (PDF, JPEG, PNG, <10MB)

- ✅ `client/src/components/tutor/TutorDocumentReview.tsx`
  - COO component to review one document at a time
  - View document link
  - Approve or reject with notes
  - Auto-advance to next step on approval

### 3. Integration with Gateway
- ✅ Updated `client/src/pages/operational/tutor/gateway.tsx`
  - Imported `SequentialDocumentSubmission` component
  - Replaced old verification upload UI with new sequential component
  - Works with both "approved" and "verification" statuses

### 4. Backend Routes Template
- ✅ Created `server/DOCUMENT_ROUTES.ts` with all 5 endpoints:
  - `POST /api/tutor/onboarding-documents/upload` - Upload signed doc
  - `GET /api/tutor/onboarding-documents/:docStep/download` - Get template
  - `GET /api/tutor/onboarding-documents/status` - Check progress
  - `GET /api/coo/tutor/:applicationId/current-document` - What to review
  - `POST /api/coo/tutor/:applicationId/document/:docStep/review` - Approve/Reject

## 🚀 Next Steps to Complete Integration

### STEP 1: Run Database Migration
```bash
# In your Supabase SQL editor, run this migration
-- Run: migrations/0021_tutor_sequential_documents.sql
```

**This adds:**
- `document_submission_step` column (tracks current step 0-5)
- `documents_status` JSON column (tracks status of each document)
- 5 document pairs of columns (for each of 5 documents)

---

### STEP 2: Add Backend Routes to server/routes.ts
Copy all route handlers from `server/DOCUMENT_ROUTES.ts` into `server/routes.ts` **after** the existing onboarding routes (around line 3196).

**Routes added:**
1. POST `/api/tutor/onboarding-documents/upload` - Accept document uploads
2. GET `/api/tutor/onboarding-documents/:docStep/download` - Serve templates
3. GET `/api/tutor/onboarding-documents/status` - Get current progress
4. GET `/api/coo/tutor/:applicationId/current-document` - Find next doc to review
5. POST `/api/coo/tutor/:applicationId/document/:docStep/review` - Approve/Reject

---

### STEP 3: Create Document Template PDFs
Place these in `client/public/pdfs/` folder:

1. **Tutor_Agreement.pdf** - Main tutoring contract
   - Responsibilities, payment terms, conduct standards
   - Tutor need to sign and date

2. **Code_of_Conduct.pdf** - Professional guidelines
   - Student interaction standards
   - Confidentiality, professional behavior
   - Acknowledgment section

3. **Emergency_Contact_Liability.pdf** - Safety & legal
   - Emergency contact information form
   - Liability waiver signature
   - Health/allergy information

4. **Background_Check_Authorization.pdf** - Screening consent
   - Authorization to run background check
   - Signature for consent
   - Acknowledgment of screening

5. **Tax_Information_Form.pdf** - Compensation setup
   - Tax ID field
   - Bank account info (encrypted)
   - W-9 or equivalent
   - Signature

**Templates can be:**
- PDF fillable forms
- Simple PDFs that tutors sign/scan
- Redirect to Google Form (modify download endpoint if needed)

---

### STEP 4: Integrate into COO Applications Page
In `client/src/pages/executive/coo/tutor-applications.tsx`:

Add to the verification tab OR create new "Document Review" section:

```tsx
import { TutorDocumentReview } from "@/components/tutor/TutorDocumentReview";

// In the verification tab content:
<TabsContent value="verification" className="space-y-4">
  {verificationApplications.length === 0 ? (
    <Card className="p-12 text-center">
      <FileCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <p className="text-muted-foreground">No documents awaiting verification</p>
    </Card>
  ) : (
    verificationApplications.map((application) => (
      <TutorDocumentReview
        key={application.id}
        application={application}
        onReview={() => {
          queryClient.invalidateQueries({
            queryKey: ["/api/coo/tutor-applications"],
          });
        }}
      />
    ))
  )}
</TabsContent>
```

---

### STEP 5: Update Application Status Flow
Update the status progression:

**Before:** `not_applied` → `pending` → `approved` → `verification` → `confirmed`

**After:** 
```
not_applied (application not submitted)
    ↓
pending (application submitted, waiting COO review)
    ↓
approved (application approved, documentSubmissionStep = 0)
    ↓
verification (uploading documents, documentSubmissionStep = 1-4)
    ↓
confirmed (all docs approved, documentSubmissionStep = 5)
```

---

### STEP 6: Setup Supabase Storage Bucket (if not using existing)
In Supabase dashboard:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutor-documents', 'tutor-documents', false);

-- RLS: Tutors can upload their own
CREATE POLICY "Tutors upload own docs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'tutor-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: Tutors view their own
CREATE POLICY "Tutors view own docs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'tutor-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: COO can view all
CREATE POLICY "COO views all docs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'tutor-documents'
  AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'coo')
);
```

---

### STEP 7: Test the Flow

**Tutor Flow:**
1. ✓ Create application and get approved
2. ✓ See "Document 1/5" in gateway
3. ✓ Click "Download Template"
4. ✓ Sign document locally
5. ✓ Click "Upload Signed Document"
6. ✓ See status "Pending review"
7. ✓ After COO approves, see "Document 2/5"
8. ✓ Repeat until all 5 complete
9. ✓ Status moves to "confirmed"

**COO Flow:**
1. ✓ Go to Applications → Verification tab
2. ✓ See only the current document per applicant
3. ✓ View document link
4. ✓ Click "Approve Document" → moves to next
5. ✓ Or "Reject & Ask for Changes" with reason
6. ✓ Tutor sees rejection reason and can re-upload
7. ✓ After approving document 5 → tutor status = "confirmed"

---

## 📋 Configuration Options

### Change Document Names
Edit `SequentialDocumentSubmission.tsx`:
```tsx
const ONBOARDING_DOCUMENTS = [
  {
    step: 1,
    title: "Your Custom Title",
    description: "Description",
    details: "Longer explanation for tutor",
  },
  // ... etc
];
```

### Change File Size Limit
In `SequentialDocumentSubmission.tsx`:
```tsx
// Current: 10MB
if (file.size > 10 * 1024 * 1024) {
  // Change 10 to your desired MB limit
```

### Change Allowed File Types
In `SequentialDocumentSubmission.tsx`:
```tsx
const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
// Add more MIME types as needed
```

### Skip Documents for Certain Users
Modify `SequentialDocumentSubmission.tsx` to conditionally skip documents:
```tsx
// Example: Skip doc 3 for over-18s
const ONBOARDING_DOCUMENTS = ONBOARDING_DOCUMENTS.filter(doc => {
  if (doc.step === 3 && !applicationStatus?.isUnder18) return false;
  return true;
});
```

---

## 📊 Database Schema Reference

```typescript
// Key new columns in tutor_applications:
documentSubmissionStep: 0-5 (current step)
documentsStatus: {
  "1": "not_started" | "pending_upload" | "pending_review" | "approved" | "rejected",
  "2": "not_started" | "pending_upload" | "pending_review" | "approved" | "rejected",
  "3": "...",
  "4": "...",
  "5": "..."
}

// For each document (repeated 5 times):
doc1TutorAgreementUrl: VARCHAR (document URL)
doc1TutorAgreementUploadedAt: TIMESTAMP
doc1TutorAgreementVerified: BOOLEAN
doc1TutorAgreementVerifiedBy: VARCHAR (COO user ID)
doc1TutorAgreementVerifiedAt: TIMESTAMP
doc1TutorAgreementRejectionReason: TEXT

// Pattern: doc{1-5}{Name}{Field}
// Names: TutorAgreement, CodeOfConduct, EmergencyWaiver, BackgroundAuth, TaxInfo
```

---

## 🐛 Troubleshooting

### Problem: Documents won't upload
- Check Supabase storage bucket exists and has correct RLS
- Check storage bucket name is `tutor-documents`
- Verify user ID matches folder structure in storage

### Problem: COO can't see documents
- Ensure COO role is set in database
- Check RLS policies allow COO role
- Verify user_id matches in storage path

### Problem: Download template returns 404
- Ensure PDF files exist in `/client/public/pdfs/` with exact names:
  - `Tutor_Agreement.pdf`
  - `Code_of_Conduct.pdf`
  - `Emergency_Contact_Liability.pdf`
  - `Background_Check_Authorization.pdf`
  - `Tax_Information_Form.pdf`

### Problem: Status not advancing
- Check if COO approval endpoint is returning correct data
- Verify `documents_status` JSON is being updated properly
- Clear browser cache and refresh

---

## 🎯 Key Features Summary

✅ **Sequential One-at-a-Time Documents**
- Tutors see only current document, not all 5
- Must complete & get approval before moving next

✅ **Progress Tracking**
- Visual % progress (1/5, 2/5, etc.)
- Status badges (not started, pending, approved, rejected)
- Clear indication which documents are done

✅ **Document Management**
- Download templates (PDF or custom format)
- Upload signed documents with validation
- View uploaded documents

✅ **COO Review Workflow**
- See only next document pending review
- Approve (moves to next step) or reject (with notes)
- Tutor is notified of rejections and can resubmit

✅ **Error Handling**
- File type validation
- File size limits
- Clear error messages
- Rejection reasons sent to tutor

---

## 🔄 Status Progression Example

```
Application submitted
         ↓
Status: pending (COO reviews application)
         ↓
Status: approved, documentSubmissionStep: 0
(Shows "Ready to start documents" message)
         ↓
Status: approved, documentSubmissionStep: 1
(Tutor downloads doc 1, signs, uploads)
         ↓
Status: verification, documentSubmissionStep: 1
(Document 1 "Pending review" - COO reviewing)
         ↓
Status: verification, documentSubmissionStep: 2
(COO approved doc 1, tutor now on doc 2)
         ↓
[Repeat for docs 3, 4, 5...]
         ↓
Status: confirmed, documentSubmissionStep: 5
(All documents approved!)
         ↓
Waiting for pod assignment...
```

---

## 📝 Notes

- All documents are tracked individually
- COO sees one applicant's current document
- Each rejection includes reason shown to tutor
- Tutor can resubmit rejected documents
- Application status stays "approved" or "verification" throughout
- Only moves to "confirmed" when all 5 documents approved
- Confirmed tutors are ready for pod assignment
