-- Add onboarding document tracking columns to tutor_applications
ALTER TABLE tutor_applications
ADD COLUMN IF NOT EXISTS trial_agreement_url VARCHAR,
ADD COLUMN IF NOT EXISTS trial_agreement_uploaded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS trial_agreement_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trial_agreement_verified_by VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS trial_agreement_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS parent_consent_url VARCHAR,
ADD COLUMN IF NOT EXISTS parent_consent_uploaded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS parent_consent_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parent_consent_verified_by VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS parent_consent_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;

-- Create storage bucket for tutor onboarding documents (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tutor-documents', 'tutor-documents', false);

-- RLS policy for tutor-documents bucket (run in Supabase dashboard):
-- CREATE POLICY "Tutors can upload their own documents" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'tutor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Tutors can view their own documents" ON storage.objects
--   FOR SELECT USING (bucket_id = 'tutor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "COO can view all tutor documents" ON storage.objects
--   FOR SELECT USING (bucket_id = 'tutor-documents' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'coo'));

COMMENT ON COLUMN tutor_applications.trial_agreement_url IS 'Supabase storage URL for signed trial tutor agreement';
COMMENT ON COLUMN tutor_applications.parent_consent_url IS 'Supabase storage URL for parent consent form (required for under-18)';
COMMENT ON COLUMN tutor_applications.trial_agreement_verified IS 'Whether COO has verified the trial agreement';
COMMENT ON COLUMN tutor_applications.parent_consent_verified IS 'Whether COO has contacted parent and verified consent';
