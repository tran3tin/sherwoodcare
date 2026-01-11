-- Add new fields to customers table and remove old payment frequency fields
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS room VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_method_1 VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_method_2 VARCHAR(255),
ADD COLUMN IF NOT EXISTS note TEXT;

-- Optional: Drop old payment frequency columns if no longer needed
-- ALTER TABLE customers
-- DROP COLUMN IF EXISTS rent_monthly,
-- DROP COLUMN IF EXISTS rent_monthly_email,
-- DROP COLUMN IF EXISTS rent_fortnightly,
-- DROP COLUMN IF EXISTS rent_fortnightly_email,
-- DROP COLUMN IF EXISTS da_weekly,
-- DROP COLUMN IF EXISTS da_weekly_email,
-- DROP COLUMN IF EXISTS social_fortnightly,
-- DROP COLUMN IF EXISTS social_fortnightly_email;
