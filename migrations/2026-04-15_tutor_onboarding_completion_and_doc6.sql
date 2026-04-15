-- Support COO-completed template uploads for steps 1-5
ALTER TABLE tutor_applications
  ADD COLUMN IF NOT EXISTS doc_1_completed_template_url text,
  ADD COLUMN IF NOT EXISTS doc_1_completed_template_uploaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS doc_1_completed_template_uploaded_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS doc_2_completed_template_url text,
  ADD COLUMN IF NOT EXISTS doc_2_completed_template_uploaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS doc_2_completed_template_uploaded_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS doc_3_completed_template_url text,
  ADD COLUMN IF NOT EXISTS doc_3_completed_template_uploaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS doc_3_completed_template_uploaded_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS doc_4_completed_template_url text,
  ADD COLUMN IF NOT EXISTS doc_4_completed_template_uploaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS doc_4_completed_template_uploaded_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS doc_5_completed_template_url text,
  ADD COLUMN IF NOT EXISTS doc_5_completed_template_uploaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS doc_5_completed_template_uploaded_by uuid REFERENCES users(id);

-- Add step 6 certified ID copy fields
ALTER TABLE tutor_applications
  ADD COLUMN IF NOT EXISTS doc_6_certified_id_copy_url text,
  ADD COLUMN IF NOT EXISTS doc_6_certified_id_copy_uploaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS doc_6_certified_id_copy_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS doc_6_certified_id_copy_verified_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS doc_6_certified_id_copy_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS doc_6_certified_id_copy_rejection_reason text;

-- Ensure documents_status default includes 6 steps
ALTER TABLE tutor_applications
  ALTER COLUMN documents_status SET DEFAULT
  '{"1":"not_started","2":"not_started","3":"not_started","4":"not_started","5":"not_started","6":"not_started"}'::jsonb;

-- Backfill documents_status for existing rows missing step 6
UPDATE tutor_applications
SET documents_status = jsonb_set(
  COALESCE(documents_status, '{}'::jsonb),
  '{6}',
  to_jsonb('not_started'::text),
  true
)
WHERE NOT COALESCE(documents_status, '{}'::jsonb) ? '6';
