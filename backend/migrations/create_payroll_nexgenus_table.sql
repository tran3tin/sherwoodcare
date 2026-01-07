-- Create payroll_nexgenus table
CREATE TABLE IF NOT EXISTS payroll_nexgenus (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payroll_nexgenus_entries table
CREATE TABLE IF NOT EXISTS payroll_nexgenus_entries (
  id SERIAL PRIMARY KEY,
  payroll_id INTEGER NOT NULL REFERENCES payroll_nexgenus(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  code VARCHAR(255),
  total_income VARCHAR(255),
  employee_bhxh VARCHAR(255),
  employee_bhyt VARCHAR(255),
  employee_bhtn VARCHAR(255),
  employer_bhxh VARCHAR(255),
  employer_tnld VARCHAR(255),
  employer_bhyt VARCHAR(255),
  employer_bhtn VARCHAR(255),
  employer_kpcd VARCHAR(255),
  pit VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_payroll_nexgenus_entries_payroll_id 
  ON payroll_nexgenus_entries(payroll_id);
