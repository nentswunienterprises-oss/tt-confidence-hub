DO $$
BEGIN
  CREATE TYPE coo_brain_library_item_kind AS ENUM ('rich_text', 'pdf');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS coo_brain_library_items (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR NOT NULL,
  kind coo_brain_library_item_kind NOT NULL,
  content TEXT,
  pdf_url TEXT,
  pdf_file_name VARCHAR,
  created_by VARCHAR NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT coo_brain_library_items_payload_check CHECK (
    (kind = 'rich_text' AND content IS NOT NULL AND pdf_url IS NULL)
    OR (kind = 'pdf' AND pdf_url IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_coo_brain_library_items_created_at
  ON coo_brain_library_items (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coo_brain_library_items_kind
  ON coo_brain_library_items (kind);
