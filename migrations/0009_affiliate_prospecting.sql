-- Affiliate Prospecting System
-- Core tables for affiliate-based parent referral prospecting

-- 1. Affiliate Codes Table
CREATE TABLE IF NOT EXISTS affiliate_codes (
  id BIGSERIAL PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_codes_affiliate_id ON affiliate_codes(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_code ON affiliate_codes(code);

-- 2. Encounters Table
CREATE TABLE IF NOT EXISTS encounters (
  id BIGSERIAL PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_name VARCHAR(255) NOT NULL,
  parent_email VARCHAR(255),
  parent_phone VARCHAR(20),
  child_name VARCHAR(255),
  child_grade VARCHAR(50),
  status VARCHAR(50) DEFAULT 'prospect',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_encounters_affiliate_id ON encounters(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_encounters_status ON encounters(status);
CREATE INDEX IF NOT EXISTS idx_encounters_created_at ON encounters(created_at DESC);

-- 3. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encounter_id BIGINT REFERENCES encounters(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lead_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_affiliate_id ON leads(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- 4. Closes Table
CREATE TABLE IF NOT EXISTS closes (
  id BIGSERIAL PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  child_id BIGINT REFERENCES students(id) ON DELETE SET NULL,
  pod_assignment_id BIGINT REFERENCES tutor_assignments(id) ON DELETE SET NULL,
  commission_amount DECIMAL(10, 2),
  commission_status VARCHAR(50) DEFAULT 'pending',
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_closes_affiliate_id ON closes(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_closes_commission_status ON closes(commission_status);
CREATE INDEX IF NOT EXISTS idx_closes_closed_at ON closes(closed_at DESC);

-- 5. Affiliate Reflections Table
CREATE TABLE IF NOT EXISTS affiliate_reflections (
  id BIGSERIAL PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_type VARCHAR(50),
  content TEXT,
  key_wins TEXT,
  challenges TEXT,
  next_steps TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_reflections_affiliate_id ON affiliate_reflections(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_reflections_created_at ON affiliate_reflections(created_at DESC);
