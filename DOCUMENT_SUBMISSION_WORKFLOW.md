# Tutor Document Submission Workflow

## Overview
Sequential document submission process for approved tutors. Tutors must complete 5 documents one at a time before pod assignment. Each document requires COO approval before moving to the next.

## 5 Required Documents

1. **Tutor Agreement** - Foundation tutoring agreement & policies
2. **Code of Conduct** - Professional standards & expectations
3. **Emergency Contact & Liability Waiver** - Safety information & liability acknowledgment
4. **Background Check Authorization** - Consent form for background screening
5. **Tax Information** - Tax ID & payment details for compensation

## Document Submission Flow

### For Tutor (in Gateway):
```
Status: Approved
  ↓
1. Download Tutor Agreement
   - Read & sign (PDF download)
   - Upload signed document
   - Wait for COO review
   ↓ (COO approves)
2. Download Code of Conduct
   - Read & acknowledge
   - Upload signed document
   - Wait for COO review
   ↓ (COO approves)
3. Download Emergency Contact & Liability Waiver
   - Complete form
   - Upload document
   - Wait for COO review
   ↓ (COO approves)
4. Download Background Check Authorization
   - Sign authorization
   - Upload document
   - Wait for COO review
   ↓ (COO approves)
5. Download Tax Information Form
   - Complete tax details
   - Upload document
   - Wait for COO review
   ↓ (COO approves)
Status: Confirmed
```

### For COO (in Applications Review):
- See current document in verification tab
- Document shows status: "Pending", "Uploaded", "Approved", "Rejected"
- Review uploaded document
- Approve (move to next) or Reject with notes (tutor must re-upload)
- Only one document active at a time

## Database Schema Changes

### New Columns in tutor_applications:
```
- document_submission_step (0-5): Current document being worked on
- documents_completed: JSON array tracking completion status of each
  {
    "1": { "status": "approved", "url": "...", "approvedAt": "..." },
    "2": { "status": "pending_upload", "url": null },
    "3": { "status": "not_started", "url": null },
    ...
  }
```

## API Endpoints

### Tutor:
- `GET /api/tutor/onboarding-documents/current` - Get current document to submit
- `GET /api/tutor/onboarding-documents/:docNumber/download` - Download template
- `POST /api/tutor/onboarding-documents/:docNumber/upload` - Upload signed doc
- `GET /api/tutor/onboarding-documents/status` - Check all documents status

### COO:
- `GET /api/coo/tutor/:appId/current-document` - Get document awaiting review
- `POST /api/coo/tutor/:appId/document/:docNumber/review` - Approve/Reject with notes
- Show rejection reason to tutor in gateway

## UI Components

### TutorGateway:
- `SequentialDocumentSubmission` - Shows current document with download/upload UI
- Progress indicator showing documents 1/5, 2/5, etc.
- Status for each: Not Started, Pending Upload, Pending Review, Approved, Rejected

### TutorApplications (COO):
- New tab "Document Review" or expand verification
- Show only current document (not all 5)
- Document viewer (PDF/image)
- Approve/Reject button with notes field
- Auto-move to next document on approval

## Status Values
- `not_started` - Document not yet downloaded
- `pending_upload` - Downloaded, waiting for tutor to upload
- `pending_review` - Uploaded, awaiting COO review
- `approved` - COO approved, move to next
- `rejected` - COO rejected, tutor must re-upload
