-- Create customers table (PostgreSQL)
CREATE TABLE IF NOT EXISTS customers (
  customer_id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  
  -- Payment Frequency checkboxes
  rent_monthly BOOLEAN DEFAULT FALSE,
  rent_monthly_email BOOLEAN DEFAULT FALSE,
  
  rent_fortnightly BOOLEAN DEFAULT FALSE,
  rent_fortnightly_email BOOLEAN DEFAULT FALSE,
  
  da_weekly BOOLEAN DEFAULT FALSE,
  da_weekly_email BOOLEAN DEFAULT FALSE,
  
  social_fortnightly BOOLEAN DEFAULT FALSE,
  social_fortnightly_email BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_name ON customers(full_name);
