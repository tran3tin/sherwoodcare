-- Create general notes ("other" notes) table
-- Used by Full Notes dashboard to store notes not tied to a customer or employee

CREATE TABLE IF NOT EXISTS general_notes (
  note_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  content TEXT,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE NULL,
  is_completed BOOLEAN DEFAULT FALSE,

  -- Pinning
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMP NULL,

  -- Optional attachment
  attachment_url TEXT NULL,
  attachment_name VARCHAR(255) NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Safety for older partial deployments
ALTER TABLE general_notes ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE general_notes ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP NULL;
ALTER TABLE general_notes ADD COLUMN IF NOT EXISTS attachment_url TEXT NULL;
ALTER TABLE general_notes ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255) NULL;

CREATE INDEX IF NOT EXISTS idx_general_notes_created_at ON general_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_general_notes_due_date ON general_notes(due_date);
CREATE INDEX IF NOT EXISTS idx_general_notes_is_completed ON general_notes(is_completed);
CREATE INDEX IF NOT EXISTS idx_general_notes_is_pinned ON general_notes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_general_notes_pinned_at ON general_notes(pinned_at);
