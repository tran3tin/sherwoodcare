-- Add pinning support to tasks table
-- Safe to run multiple times

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_is_pinned ON tasks(is_pinned);
CREATE INDEX IF NOT EXISTS idx_tasks_pinned_at ON tasks(pinned_at);
