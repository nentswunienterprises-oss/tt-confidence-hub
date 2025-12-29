-- Brain Module: People Registry
CREATE TYPE person_status AS ENUM ('active', 'paused', 'exiting');

CREATE TABLE people_registry (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id),
  full_name VARCHAR NOT NULL,
  role_title VARCHAR NOT NULL,
  role_description TEXT,
  short_bio TEXT,
  pod_id VARCHAR REFERENCES pods(id),
  team_name VARCHAR,
  start_date TIMESTAMP,
  contract_url VARCHAR,
  nda_url VARCHAR,
  status person_status NOT NULL DEFAULT 'active',
  email VARCHAR,
  phone VARCHAR,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Brain Module: Details (Weekly Deliverables)
CREATE TYPE detail_status AS ENUM ('pending', 'done', 'missed');

CREATE TABLE details (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id VARCHAR NOT NULL REFERENCES people_registry(id),
  description TEXT NOT NULL,
  due_date TIMESTAMP NOT NULL,
  status detail_status NOT NULL DEFAULT 'pending',
  week_number INTEGER,
  fulfilled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by VARCHAR REFERENCES users(id)
);

-- Brain Module: Projects
CREATE TYPE project_status AS ENUM ('active', 'at_risk', 'completed');
CREATE TYPE project_horizon AS ENUM ('30', '60', '90');

CREATE TABLE projects (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  owner_id VARCHAR REFERENCES people_registry(id),
  horizon project_horizon NOT NULL DEFAULT '30',
  objective TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'active',
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by VARCHAR REFERENCES users(id)
);

-- Brain Module: Project Details Link
CREATE TABLE project_details (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR NOT NULL REFERENCES projects(id),
  detail_id VARCHAR NOT NULL REFERENCES details(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Brain Module: Ideas
CREATE TYPE idea_status AS ENUM ('new', 'reviewed', 'approved', 'archived');
CREATE TYPE pillar AS ENUM ('revenue', 'reputation', 'systems', 'culture', 'other');

CREATE TABLE ideas (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  pillar pillar NOT NULL DEFAULT 'other',
  problem_solved TEXT,
  status idea_status NOT NULL DEFAULT 'new',
  submitted_by VARCHAR REFERENCES users(id),
  submitter_name VARCHAR,
  submitter_role VARCHAR,
  reviewed_by VARCHAR REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  converted_to_project_id VARCHAR REFERENCES projects(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Disputes Module: Disputes
CREATE TYPE dispute_type AS ENUM ('miscommunication', 'missed_responsibility', 'disrespect', 'performance_concern');
CREATE TYPE dispute_outcome AS ENUM ('clarity', 'apology', 'decision', 'separation');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'escalated');

CREATE TABLE disputes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  logged_by VARCHAR REFERENCES users(id),
  logged_by_name VARCHAR,
  involved_parties JSONB,
  involved_party_names JSONB,
  dispute_type dispute_type NOT NULL,
  description TEXT NOT NULL,
  desired_outcome dispute_outcome NOT NULL,
  status dispute_status NOT NULL DEFAULT 'open',
  visible_to JSONB DEFAULT '["hr", "ceo"]',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Disputes Module: Resolutions
CREATE TYPE resolution_action AS ENUM ('clarification_requested', 'mediated_discussion', 'warning_issued', 'role_change_recommended', 'exit_recommended');

CREATE TABLE dispute_resolutions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id VARCHAR NOT NULL REFERENCES disputes(id),
  action resolution_action NOT NULL,
  summary TEXT NOT NULL,
  decision TEXT NOT NULL,
  follow_up_date TIMESTAMP,
  resolved_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_people_registry_status ON people_registry(status);
CREATE INDEX idx_details_person_id ON details(person_id);
CREATE INDEX idx_details_status ON details(status);
CREATE INDEX idx_details_due_date ON details(due_date);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_submitted_by ON ideas(submitted_by);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_logged_by ON disputes(logged_by);
CREATE INDEX idx_dispute_resolutions_dispute_id ON dispute_resolutions(dispute_id);

-- Disable RLS for these tables (HR-only access controlled at API level)
ALTER TABLE people_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE details ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_resolutions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (API controls access)
CREATE POLICY "Allow all for authenticated" ON people_registry FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON details FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON project_details FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON ideas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON disputes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON dispute_resolutions FOR ALL USING (true) WITH CHECK (true);
