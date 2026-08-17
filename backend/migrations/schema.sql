-- =====================================================================
-- SCHEMA.SQL — MySQL 8.0+
-- Consolidation of all PostgreSQL/Supabase migrations → single MySQL schema
-- Gộp từ: 00_init_all_tables, 01..09, create_* , alter_* , add_dates, remove_card...
--
-- Idempotent: safe to run many times. All indexes are defined inline via
-- KEY `name` (...) inside CREATE TABLE so `CREATE TABLE IF NOT EXISTS`
-- never conflicts on re-run (MySQL has no CREATE INDEX IF NOT EXISTS).
-- =====================================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NULL,
  last_name VARCHAR(255) NULL,
  reference VARCHAR(255) NULL,
  room VARCHAR(255) NULL,
  payment_method_1 VARCHAR(255) NULL,
  payment_method_2 VARCHAR(255) NULL,
  note TEXT NULL,

  -- Legacy payment frequency fields (kept for backward compatibility)
  rent_monthly BOOLEAN DEFAULT FALSE,
  rent_monthly_email BOOLEAN DEFAULT FALSE,
  rent_fortnightly BOOLEAN DEFAULT FALSE,
  rent_fortnightly_email BOOLEAN DEFAULT FALSE,
  da_weekly BOOLEAN DEFAULT FALSE,
  da_weekly_email BOOLEAN DEFAULT FALSE,
  social_fortnightly BOOLEAN DEFAULT FALSE,
  social_fortnightly_email BOOLEAN DEFAULT FALSE,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_customer_name (full_name),
  KEY idx_customer_last_name (last_name),
  KEY idx_customer_first_name (first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employers (
  employer_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,

  rent_monthly BOOLEAN DEFAULT FALSE,
  rent_monthly_email BOOLEAN DEFAULT FALSE,
  rent_fortnightly BOOLEAN DEFAULT FALSE,
  rent_fortnightly_email BOOLEAN DEFAULT FALSE,
  da_weekly BOOLEAN DEFAULT FALSE,
  da_weekly_email BOOLEAN DEFAULT FALSE,
  social_fortnightly BOOLEAN DEFAULT FALSE,
  social_fortnightly_email BOOLEAN DEFAULT FALSE,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_employer_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employees (
  employee_id INT AUTO_INCREMENT PRIMARY KEY,
  last_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  preferred_name VARCHAR(255) NULL,
  level VARCHAR(50) NULL,
  social_level VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_employee_name (last_name, first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_invoices (
  invoice_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  invoice_date DATE NOT NULL,
  invoice_no VARCHAR(100) NULL,
  memory VARCHAR(255) NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_due DECIMAL(12,2) NOT NULL DEFAULT 0,
  note TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_invoice_customer (customer_id),
  KEY idx_invoice_date (invoice_date),
  KEY idx_invoice_no (invoice_no),
  CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_notes (
  note_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT '',
  content TEXT NULL,
  priority VARCHAR(10) DEFAULT 'medium',
  due_date DATE NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at DATETIME NULL,
  attachment_url VARCHAR(500) NULL,
  attachment_name VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_customer_notes_customer_id (customer_id),
  KEY idx_customer_notes_is_completed (is_completed),
  KEY idx_customer_notes_is_pinned (is_pinned),
  KEY idx_customer_notes_pinned_at (pinned_at),
  KEY idx_customer_notes_priority (priority),
  KEY idx_customer_notes_due_date (due_date),
  CONSTRAINT fk_customer_notes_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employee_notes (
  note_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT '',
  content TEXT NULL,
  priority VARCHAR(10) DEFAULT 'medium',
  due_date DATE NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at DATETIME NULL,
  attachment_url VARCHAR(500) NULL,
  attachment_name VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_employee_notes_employee_id (employee_id),
  KEY idx_employee_notes_is_completed (is_completed),
  KEY idx_employee_notes_is_pinned (is_pinned),
  KEY idx_employee_notes_pinned_at (pinned_at),
  KEY idx_employee_notes_priority (priority),
  KEY idx_employee_notes_due_date (due_date),
  CONSTRAINT fk_employee_notes_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS general_notes (
  note_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  content TEXT NULL,
  priority VARCHAR(10) DEFAULT 'medium',
  due_date DATE NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at DATETIME NULL,
  attachment_url TEXT NULL,
  attachment_name VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_general_notes_created_at (created_at),
  KEY idx_general_notes_due_date (due_date),
  KEY idx_general_notes_is_completed (is_completed),
  KEY idx_general_notes_is_pinned (is_pinned),
  KEY idx_general_notes_pinned_at (pinned_at),
  KEY idx_general_notes_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timesheet_periods (
  period_id INT AUTO_INCREMENT PRIMARY KEY,
  start_date DATE NOT NULL,
  num_days INT NOT NULL,
  num_rows INT NOT NULL,
  name VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timesheet_entries (
  entry_id INT AUTO_INCREMENT PRIMARY KEY,
  period_id INT NOT NULL,
  row_num INT NOT NULL,
  note VARCHAR(255) NULL,
  period VARCHAR(100) NULL,
  hrs VARCHAR(50) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_timesheet_entries (period_id, row_num),
  KEY idx_entries_period (period_id),
  CONSTRAINT fk_timesheet_entries_period FOREIGN KEY (period_id) REFERENCES timesheet_periods(period_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timesheet_days (
  day_id INT AUTO_INCREMENT PRIMARY KEY,
  entry_id INT NOT NULL,
  day_index INT NOT NULL,
  staff_name VARCHAR(255) NULL,
  UNIQUE KEY uq_timesheet_days (entry_id, day_index),
  KEY idx_days_entry (entry_id),
  CONSTRAINT fk_timesheet_days_entry FOREIGN KEY (entry_id) REFERENCES timesheet_entries(entry_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timesheetreport (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  start_date DATE NOT NULL,
  num_days INT NOT NULL,
  num_rows INT NOT NULL,
  name VARCHAR(255) NULL,
  processed_data TEXT NULL,
  date_headers TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timesheetreport_entries (
  entry_id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  row_num INT NOT NULL,
  note VARCHAR(255) NULL,
  period VARCHAR(100) NULL,
  hrs VARCHAR(50) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_timesheetreport_entries (report_id, row_num),
  KEY idx_report_entries_report (report_id),
  CONSTRAINT fk_tsreport_entries_report FOREIGN KEY (report_id) REFERENCES timesheetreport(report_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timesheetreport_days (
  day_id INT AUTO_INCREMENT PRIMARY KEY,
  entry_id INT NOT NULL,
  day_index INT NOT NULL,
  staff_name VARCHAR(255) NULL,
  UNIQUE KEY uq_timesheetreport_days (entry_id, day_index),
  KEY idx_report_days_entry (entry_id),
  CONSTRAINT fk_tsreport_days_entry FOREIGN KEY (entry_id) REFERENCES timesheetreport_entries(entry_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS social_sheets (
  sheet_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  rows_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_social_sheets_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payroll_nexgenus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  start_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payroll_nexgenus_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payroll_id INT NOT NULL,
  row_num INT NOT NULL,
  code VARCHAR(255) NULL,
  total_income VARCHAR(255) NULL,
  employee_bhxh VARCHAR(255) NULL,
  employee_bhyt VARCHAR(255) NULL,
  employee_bhtn VARCHAR(255) NULL,
  employer_bhxh VARCHAR(255) NULL,
  employer_tnld VARCHAR(255) NULL,
  employer_bhyt VARCHAR(255) NULL,
  employer_bhtn VARCHAR(255) NULL,
  employer_kpcd VARCHAR(255) NULL,
  pit VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_payroll_nexgenus_entries_payroll_id (payroll_id),
  CONSTRAINT fk_payroll_entries_payroll FOREIGN KEY (payroll_id) REFERENCES payroll_nexgenus(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'todo',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  due_date DATE NULL,
  assigned_to VARCHAR(255) NULL,
  position INT NOT NULL DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at DATETIME NULL,
  attachment_url VARCHAR(500) NULL,
  attachment_name VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_tasks_status (status),
  KEY idx_tasks_position (position),
  KEY idx_tasks_is_pinned (is_pinned),
  KEY idx_tasks_pinned_at (pinned_at),
  KEY idx_tasks_priority (priority),
  KEY idx_tasks_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_attachments (
  attachment_id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_task_attachments_task_id (task_id),
  CONSTRAINT fk_task_attachments_task FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS training_articles (
  article_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT NULL,
  attachment_name VARCHAR(255) NULL,
  attachments JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_training_articles_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores metadata for files uploaded to the upload endpoint
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Stores metadata for files uploaded to Uploads volume',
  name VARCHAR(255) NOT NULL COMMENT 'Original file name',
  file_url TEXT NOT NULL COMMENT 'Public URL to the stored file',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_documents_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;