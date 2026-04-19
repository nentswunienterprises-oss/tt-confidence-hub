-- Reset legacy tutor onboarding progress for approved applications that have not
-- completed onboarding yet, so they restart on the new in-app agreement flow.
--
-- Scope:
-- - tutor_applications.status = 'approved'
-- - onboarding_completed_at IS NULL
--
-- Effect:
-- - clears legacy upload/review state for steps 1-6
-- - removes in-app acceptance records created during rollout/testing
-- - resets document_submission_step to 1
-- - resets documents_status to the new flow starting state

BEGIN;

WITH target_applications AS (
  SELECT id
  FROM tutor_applications
  WHERE status = 'approved'
    AND onboarding_completed_at IS NULL
)
DELETE FROM tutor_onboarding_acceptance_events
WHERE application_id IN (SELECT id FROM target_applications);

WITH target_applications AS (
  SELECT id
  FROM tutor_applications
  WHERE status = 'approved'
    AND onboarding_completed_at IS NULL
)
DELETE FROM tutor_onboarding_acceptances
WHERE application_id IN (SELECT id FROM target_applications);

WITH target_applications AS (
  SELECT id
  FROM tutor_applications
  WHERE status = 'approved'
    AND onboarding_completed_at IS NULL
)
UPDATE tutor_applications
SET
  document_submission_step = 1,
  documents_status = '{"1":"pending_upload","2":"not_started","3":"not_started","4":"not_started","5":"not_started","6":"not_started"}'::jsonb,

  doc_1_submission_url = NULL,
  doc_1_submission_uploaded_at = NULL,
  doc_1_submission_verified = false,
  doc_1_submission_verified_by = NULL,
  doc_1_submission_verified_at = NULL,
  doc_1_submission_rejection_reason = NULL,
  doc_1_completed_template_url = NULL,
  doc_1_completed_template_uploaded_at = NULL,
  doc_1_completed_template_uploaded_by = NULL,

  doc_2_submission_url = NULL,
  doc_2_submission_uploaded_at = NULL,
  doc_2_submission_verified = false,
  doc_2_submission_verified_by = NULL,
  doc_2_submission_verified_at = NULL,
  doc_2_submission_rejection_reason = NULL,
  doc_2_completed_template_url = NULL,
  doc_2_completed_template_uploaded_at = NULL,
  doc_2_completed_template_uploaded_by = NULL,

  doc_3_submission_url = NULL,
  doc_3_submission_uploaded_at = NULL,
  doc_3_submission_verified = false,
  doc_3_submission_verified_by = NULL,
  doc_3_submission_verified_at = NULL,
  doc_3_submission_rejection_reason = NULL,
  doc_3_completed_template_url = NULL,
  doc_3_completed_template_uploaded_at = NULL,
  doc_3_completed_template_uploaded_by = NULL,

  doc_4_submission_url = NULL,
  doc_4_submission_uploaded_at = NULL,
  doc_4_submission_verified = false,
  doc_4_submission_verified_by = NULL,
  doc_4_submission_verified_at = NULL,
  doc_4_submission_rejection_reason = NULL,
  doc_4_completed_template_url = NULL,
  doc_4_completed_template_uploaded_at = NULL,
  doc_4_completed_template_uploaded_by = NULL,

  doc_5_submission_url = NULL,
  doc_5_submission_uploaded_at = NULL,
  doc_5_submission_verified = false,
  doc_5_submission_verified_by = NULL,
  doc_5_submission_verified_at = NULL,
  doc_5_submission_rejection_reason = NULL,
  doc_5_completed_template_url = NULL,
  doc_5_completed_template_uploaded_at = NULL,
  doc_5_completed_template_uploaded_by = NULL,

  doc_6_submission_url = NULL,
  doc_6_submission_uploaded_at = NULL,
  doc_6_submission_verified = false,
  doc_6_submission_verified_by = NULL,
  doc_6_submission_verified_at = NULL,
  doc_6_submission_rejection_reason = NULL,

  updated_at = NOW()
WHERE id IN (SELECT id FROM target_applications);

COMMIT;
