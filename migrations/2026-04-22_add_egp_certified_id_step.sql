ALTER TABLE affiliate_applications
ADD COLUMN IF NOT EXISTS doc_5_submission_url TEXT,
ADD COLUMN IF NOT EXISTS doc_5_submission_uploaded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS doc_5_submission_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS doc_5_submission_reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS doc_5_submission_rejection_reason TEXT;

ALTER TABLE affiliate_applications
ALTER COLUMN documents_status SET DEFAULT '{"1":"not_started","2":"not_started","3":"not_started","4":"not_started","5":"not_started"}'::jsonb;

UPDATE affiliate_applications
SET documents_status = jsonb_set(
  COALESCE(documents_status, '{}'::jsonb),
  '{5}',
  '"not_started"'::jsonb,
  true
)
WHERE NOT COALESCE(documents_status, '{}'::jsonb) ? '5';
