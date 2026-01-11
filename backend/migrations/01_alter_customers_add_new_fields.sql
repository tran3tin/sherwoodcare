-- Migration to add new fields to customers table
-- This will run after the initial table creation

-- Add new columns if they don't exist
DO $$
BEGIN
    -- Add first_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'first_name'
    ) THEN
        ALTER TABLE customers ADD COLUMN first_name VARCHAR(255);
    END IF;

    -- Add last_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'last_name'
    ) THEN
        ALTER TABLE customers ADD COLUMN last_name VARCHAR(255);
    END IF;

    -- Add reference column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'reference'
    ) THEN
        ALTER TABLE customers ADD COLUMN reference VARCHAR(255);
    END IF;

    -- Add room column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'room'
    ) THEN
        ALTER TABLE customers ADD COLUMN room VARCHAR(255);
    END IF;

    -- Add payment_method_1 column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'payment_method_1'
    ) THEN
        ALTER TABLE customers ADD COLUMN payment_method_1 VARCHAR(255);
    END IF;

    -- Add payment_method_2 column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'payment_method_2'
    ) THEN
        ALTER TABLE customers ADD COLUMN payment_method_2 VARCHAR(255);
    END IF;

    -- Add note column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'note'
    ) THEN
        ALTER TABLE customers ADD COLUMN note TEXT;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_customer_last_name ON customers(last_name);
CREATE INDEX IF NOT EXISTS idx_customer_first_name ON customers(first_name);

-- Backfill first_name and last_name from full_name if they are null
-- This is a naive split and might not be perfect for all names
UPDATE customers 
SET 
  first_name = COALESCE(first_name, split_part(full_name, ' ', 1)),
  last_name = COALESCE(last_name, substring(full_name from position(' ' in full_name) + 1))
WHERE full_name IS NOT NULL 
  AND (first_name IS NULL OR last_name IS NULL)
  AND position(' ' in full_name) > 0;

-- For names without spaces, put everything in last_name
UPDATE customers 
SET 
  last_name = COALESCE(last_name, full_name),
  first_name = COALESCE(first_name, '')
WHERE full_name IS NOT NULL 
  AND (first_name IS NULL OR last_name IS NULL)
  AND position(' ' in full_name) = 0;
