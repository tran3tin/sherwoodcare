-- Auto-migration script for Supabase
-- This file creates all necessary tables for the application

-- ============================================
-- 1. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  customer_id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  reference VARCHAR(255),
  room VARCHAR(255),
  payment_method_1 VARCHAR(255),
  payment_method_2 VARCHAR(255),
  note TEXT,
  
  -- Legacy payment frequency fields (kept for backward compatibility)
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
CREATE INDEX IF NOT EXISTS idx_customer_last_name ON customers(last_name);
CREATE INDEX IF NOT EXISTS idx_customer_first_name ON customers(first_name);

-- ============================================
-- 2. EMPLOYERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employers (
  employer_id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  
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
CREATE INDEX IF NOT EXISTS idx_employer_name ON employers(full_name);

-- ============================================
-- 3. EMPLOYEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  employee_id SERIAL PRIMARY KEY,
  last_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  preferred_name VARCHAR(255),
  level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_employee_name ON employees(last_name, first_name);

-- ============================================
-- 4. CUSTOMER INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customer_invoices (
  invoice_id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  invoice_date DATE NOT NULL,
  invoice_no VARCHAR(100) NULL,
  memory VARCHAR(255) NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_due DECIMAL(12,2) NOT NULL DEFAULT 0,
  note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_invoice_customer ON customer_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoice_date ON customer_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_no ON customer_invoices(invoice_no);

-- ============================================
-- 5. CUSTOMER NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customer_notes (
  note_id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT '',
  content TEXT,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMP NULL,
  attachment_url VARCHAR(500) NULL,
  attachment_name VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_is_completed ON customer_notes(is_completed);
CREATE INDEX IF NOT EXISTS idx_customer_notes_is_pinned ON customer_notes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_customer_notes_pinned_at ON customer_notes(pinned_at);
CREATE INDEX IF NOT EXISTS idx_customer_notes_priority ON customer_notes(priority);
CREATE INDEX IF NOT EXISTS idx_customer_notes_due_date ON customer_notes(due_date);

-- ============================================
-- 6. EMPLOYEE NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employee_notes (
  note_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT '',
  content TEXT,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMP NULL,
  attachment_url VARCHAR(500) NULL,
  attachment_name VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_employee_notes_employee_id ON employee_notes(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_notes_is_completed ON employee_notes(is_completed);
CREATE INDEX IF NOT EXISTS idx_employee_notes_is_pinned ON employee_notes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_employee_notes_pinned_at ON employee_notes(pinned_at);
CREATE INDEX IF NOT EXISTS idx_employee_notes_priority ON employee_notes(priority);
CREATE INDEX IF NOT EXISTS idx_employee_notes_due_date ON employee_notes(due_date);

-- ============================================
-- 7. TIMESHEET TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS timesheet_periods (
  period_id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  num_days INTEGER NOT NULL CHECK (num_days IN (7,14,21,30)),
  num_rows INTEGER NOT NULL CHECK (num_rows BETWEEN 1 AND 200),
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timesheet_entries (
  entry_id SERIAL PRIMARY KEY,
  period_id INTEGER REFERENCES timesheet_periods(period_id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  note VARCHAR(255),
  period VARCHAR(100),
  hrs VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (period_id, row_number)
);

CREATE TABLE IF NOT EXISTS timesheet_days (
  day_id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES timesheet_entries(entry_id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL CHECK (day_index BETWEEN 0 AND 29),
  staff_name VARCHAR(255),
  UNIQUE (entry_id, day_index)
);

CREATE INDEX IF NOT EXISTS idx_entries_period ON timesheet_entries(period_id);
CREATE INDEX IF NOT EXISTS idx_days_entry ON timesheet_days(entry_id);

-- ============================================
-- 8. TIMESHEET REPORT TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS timesheetreport (
  report_id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  num_days INTEGER NOT NULL CHECK (num_days IN (7,14,21,30)),
  num_rows INTEGER NOT NULL CHECK (num_rows BETWEEN 1 AND 200),
  name VARCHAR(255),
  processed_data TEXT,
  date_headers TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timesheetreport_entries (
  entry_id SERIAL PRIMARY KEY,
  report_id INTEGER REFERENCES timesheetreport(report_id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  note VARCHAR(255),
  period VARCHAR(100),
  hrs VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (report_id, row_number)
);

CREATE TABLE IF NOT EXISTS timesheetreport_days (
  day_id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES timesheetreport_entries(entry_id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL CHECK (day_index BETWEEN 0 AND 29),
  staff_name VARCHAR(255),
  UNIQUE (entry_id, day_index)
);

CREATE INDEX IF NOT EXISTS idx_report_entries_report ON timesheetreport_entries(report_id);
CREATE INDEX IF NOT EXISTS idx_report_days_entry ON timesheetreport_days(entry_id);

-- ============================================
-- 9. SOCIAL SHEETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS social_sheets (
  sheet_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  rows_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_social_sheets_created ON social_sheets(created_at);

-- ============================================
-- 10. PAYROLL NEXGENUS TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS payroll_nexgenus (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE INDEX IF NOT EXISTS idx_payroll_nexgenus_entries_payroll_id ON payroll_nexgenus_entries(payroll_id);

-- ============================================
-- 11. TASKS TABLE (Kanban Board)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(position);
