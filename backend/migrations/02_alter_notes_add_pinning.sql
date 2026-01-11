-- Adds pinning fields to customer_notes and employee_notes (safe to run multiple times)

-- Customer notes
ALTER TABLE customer_notes
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

ALTER TABLE customer_notes
  ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_customer_notes_is_pinned ON customer_notes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_customer_notes_pinned_at ON customer_notes(pinned_at);

-- Employee notes
ALTER TABLE employee_notes
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

ALTER TABLE employee_notes
  ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_employee_notes_is_pinned ON employee_notes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_employee_notes_pinned_at ON employee_notes(pinned_at);
