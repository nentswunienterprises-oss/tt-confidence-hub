CREATE TABLE IF NOT EXISTS affiliate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  reach_in_7_days TEXT NOT NULL,
  first_parents TEXT NOT NULL,
  student_breakdown_case TEXT NOT NULL,
  marks_signal TEXT NOT NULL,
  extra_lessons_response TEXT NOT NULL,
  not_recommend_cases TEXT NOT NULL,
  unclear_problem_response TEXT NOT NULL,
  ten_parents_filter TEXT NOT NULL,
  first_academic_question TEXT NOT NULL,
  no_earnings_response TEXT NOT NULL,
  next_five_days_plan TEXT NOT NULL,
  proceed_reason TEXT NOT NULL,
  trust_reason TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  onboarding_completed_at TIMESTAMPTZ,
  document_submission_step INTEGER DEFAULT 0,
  documents_status JSONB NOT NULL DEFAULT '{"1":"not_started","2":"not_started","3":"not_started","4":"not_started"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_applications_user_id ON affiliate_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_status ON affiliate_applications(status);

CREATE TABLE IF NOT EXISTS affiliate_onboarding_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES affiliate_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_step INTEGER NOT NULL,
  document_code TEXT NOT NULL,
  document_title TEXT NOT NULL,
  document_version TEXT NOT NULL,
  document_snapshot TEXT NOT NULL,
  document_checksum TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_timezone TEXT,
  acceptance_method onboarding_acceptance_method NOT NULL DEFAULT 'checkbox_typed_name',
  typed_full_name TEXT NOT NULL,
  account_email TEXT NOT NULL,
  phone_number_snapshot TEXT,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  platform TEXT,
  session_id TEXT,
  locale TEXT,
  source_flow TEXT,
  form_snapshot_json JSONB,
  accepted_clauses_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  scroll_completion_percent INTEGER,
  view_started_at TIMESTAMPTZ,
  view_completed_at TIMESTAMPTZ,
  accept_clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_onboarding_acceptances_application_id
  ON affiliate_onboarding_acceptances(application_id);

CREATE TABLE IF NOT EXISTS affiliate_onboarding_clause_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acceptance_id UUID NOT NULL REFERENCES affiliate_onboarding_acceptances(id) ON DELETE CASCADE,
  clause_key TEXT NOT NULL,
  clause_label TEXT NOT NULL,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_onboarding_acceptance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acceptance_id UUID REFERENCES affiliate_onboarding_acceptances(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES affiliate_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_step INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
