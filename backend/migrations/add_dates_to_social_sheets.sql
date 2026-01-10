-- Add start_date and end_date columns to social_sheets table (PostgreSQL)
ALTER TABLE social_sheets ADD COLUMN IF NOT EXISTS start_date DATE NULL;
ALTER TABLE social_sheets ADD COLUMN IF NOT EXISTS end_date DATE NULL;
