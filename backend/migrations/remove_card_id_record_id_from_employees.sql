-- Migration: Remove card_id and record_id columns from employees table
-- Date: 2026-01-08

-- Drop indexes first
DROP INDEX IF EXISTS idx_employees_card_id;
DROP INDEX IF EXISTS idx_employees_record_id;

-- Remove columns
ALTER TABLE employees DROP COLUMN IF EXISTS card_id;
ALTER TABLE employees DROP COLUMN IF EXISTS record_id;
