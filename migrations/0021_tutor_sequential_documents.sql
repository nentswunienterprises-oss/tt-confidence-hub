-- Add sequential document submission tracking to tutor_applications
-- Supports 5-step document onboarding process

ALTER TABLE tutor_applications
ADD COLUMN IF NOT EXISTS document_submission_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS documents_status JSONB DEFAULT '{"1": "not_started", "2": "not_started", "3": "not_started", "4": "not_started", "5": "not_started"}';

-- Document tables for each step (1-5)
-- Step 1: Tutor Agreement
ALTER TABLE tutor_applications
ADD COLUMN IF NOT EXISTS doc_1_tutor_agreement_url VARCHAR,
ADD COLUMN IF NOT EXISTS doc_1_tutor_agreement_uploaded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS doc_1_tutor_agreement_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS doc_1_tutor_agreement_verified_by VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS doc_1_tutor_agreement_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS doc_1_tutor_agreement_rejection_reason TEXT;

-- Step 2: Code of Conduct
ALTER TABLE tutor_applications
ADD COLUMN IF NOT EXISTS doc_2_code_of_conduct_url VARCHAR,
ADD COLUMN IF NOT EXISTS doc_2_code_of_conduct_uploaded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS doc_2_code_of_conduct_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS doc_2_code_of_conduct_verified_by VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS doc_2_code_of_conduct_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS doc_2_code_of_conduct_rejection_reason TEXT;

-- Step 3: Emergency Contact & Liability Waiver
ALTER TABLE tutor_applications
ADD COLUMN IF NOT EXISTS doc_3_emergency_waiver_url VARCHAR,
ADD COLUMN IF NOT EXISTS doc_3_emergency_waiver_uploaded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS doc_3_emergency_waiver_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS doc_3_emergency_waiver_verified_by VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS doc_3_emergency_waiver_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS doc_3_emergency_waiver_rejection_reason TEXT;

-- Step 4: Background Check Authorization
ALTER TABLE tutor_applications
ADD COLUMN IF NOT EXISTS doc_4_background_auth_url VARCHAR,
ADD COLUMN IF NOT EXISTS doc_4_background_auth_uploaded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS doc_4_background_auth_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS doc_4_background_auth_verified_by VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS doc_4_background_auth_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS doc_4_background_auth_rejection_reason TEXT;

-- Step 5: Tax Information
ALTER TABLE tutor_applications
ADD COLUMN IF NOT EXISTS doc_5_tax_info_url VARCHAR,
ADD COLUMN IF NOT EXISTS doc_5_tax_info_uploaded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS doc_5_tax_info_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS doc_5_tax_info_verified_by VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS doc_5_tax_info_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS doc_5_tax_info_rejection_reason TEXT;

-- Add comments for clarity
COMMENT ON COLUMN tutor_applications.document_submission_step IS 'Current step in 5-step document submission (0-5, where 0=not started, 5=all complete)';
COMMENT ON COLUMN tutor_applications.documents_status IS 'JSON tracking status of each document: not_started, pending_upload, pending_review, approved, rejected';

COMMENT ON COLUMN tutor_applications.doc_1_tutor_agreement_url IS 'Signed tutor agreement document';
COMMENT ON COLUMN tutor_applications.doc_2_code_of_conduct_url IS 'Code of conduct acknowledgment';
COMMENT ON COLUMN tutor_applications.doc_3_emergency_waiver_url IS 'Emergency contact & liability waiver';
COMMENT ON COLUMN tutor_applications.doc_4_background_auth_url IS 'Background check authorization';
COMMENT ON COLUMN tutor_applications.doc_5_tax_info_url IS 'Tax information form';
