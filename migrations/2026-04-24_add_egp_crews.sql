DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'egp_crew_status') THEN
    CREATE TYPE egp_crew_status AS ENUM ('active', 'archived');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'egp_crew_member_role') THEN
    CREATE TYPE egp_crew_member_role AS ENUM ('member', 'crew_lead');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS egp_crews (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_name varchar(255) NOT NULL,
  territory varchar(255),
  status egp_crew_status NOT NULL DEFAULT 'active',
  created_by varchar(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS egp_crew_members (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id varchar(255) NOT NULL REFERENCES egp_crews(id) ON DELETE CASCADE,
  egp_id varchar(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role egp_crew_member_role NOT NULL DEFAULT 'member',
  joined_at timestamp without time zone NOT NULL DEFAULT now(),
  removed_at timestamp without time zone
);

CREATE INDEX IF NOT EXISTS idx_egp_crews_status ON egp_crews(status);
CREATE INDEX IF NOT EXISTS idx_egp_crew_members_crew_id ON egp_crew_members(crew_id);
CREATE INDEX IF NOT EXISTS idx_egp_crew_members_egp_id ON egp_crew_members(egp_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_egp_crew_members_active_egp
ON egp_crew_members(egp_id)
WHERE removed_at IS NULL;
