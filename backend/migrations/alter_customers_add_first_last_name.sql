ALTER TABLE customers
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);

-- Optional: Attempt to backfill first_name and last_name from full_name if it exists
-- This is a naive split and might not be perfect for all names
UPDATE customers 
SET 
  first_name = split_part(full_name, ' ', 1),
  last_name = substring(full_name from position(' ' in full_name) + 1)
WHERE full_name IS NOT NULL AND first_name IS NULL;

-- If you want to make them required later, you'd do:
-- ALTER TABLE customers ALTER COLUMN first_name SET NOT NULL;
-- ALTER TABLE customers ALTER COLUMN last_name SET NOT NULL;
