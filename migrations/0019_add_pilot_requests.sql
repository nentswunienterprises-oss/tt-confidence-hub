-- Migration: Add Leadership Pilot and Early Intervention Pilot request tables

-- Leadership Pilot Requests
CREATE TABLE IF NOT EXISTS leadership_pilot_requests (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name VARCHAR NOT NULL,
  contact_person_name VARCHAR,
  contact_person_phone VARCHAR,
  contact_person_role VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  submitted_by VARCHAR REFERENCES users(id),
  submitter_name VARCHAR,
  submitter_role VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'new',
  submitted_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leadership_pilot_requests_submitted_at ON leadership_pilot_requests(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_leadership_pilot_requests_email ON leadership_pilot_requests(email);
CREATE INDEX IF NOT EXISTS idx_leadership_pilot_requests_submitted_by ON leadership_pilot_requests(submitted_by);

ALTER TABLE leadership_pilot_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON leadership_pilot_requests FOR ALL USING (true) WITH CHECK (true);

-- Early Intervention Pilot Requests
CREATE TABLE IF NOT EXISTS early_intervention_requests (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name VARCHAR NOT NULL,
  contact_person_name VARCHAR,
  contact_person_phone VARCHAR,
  contact_person_role VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  submitted_by VARCHAR REFERENCES users(id),
  submitter_name VARCHAR,
  submitter_role VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'new',
  submitted_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_early_intervention_requests_submitted_at ON early_intervention_requests(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_early_intervention_requests_email ON early_intervention_requests(email);
CREATE INDEX IF NOT EXISTS idx_early_intervention_requests_submitted_by ON early_intervention_requests(submitted_by);

ALTER TABLE early_intervention_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON early_intervention_requests FOR ALL USING (true) WITH CHECK (true);
