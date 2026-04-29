ALTER TABLE td_applications
  ADD COLUMN IF NOT EXISTS id_type TEXT,
  ADD COLUMN IF NOT EXISTS id_number TEXT,
  ADD COLUMN IF NOT EXISTS doc_7_submission_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_7_submission_uploaded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS doc_7_submission_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS doc_7_submission_reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS doc_7_submission_rejection_reason TEXT;
