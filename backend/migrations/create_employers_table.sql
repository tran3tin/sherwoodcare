-- Create employers table
CREATE TABLE IF NOT EXISTS employers (
  employer_id INT AUTO_INCREMENT PRIMARY KEY,
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_employer_name (full_name)
);
