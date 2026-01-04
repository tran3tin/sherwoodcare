-- Create customer_invoices table
CREATE TABLE IF NOT EXISTS customer_invoices (
  invoice_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,

  invoice_date DATE NOT NULL,
  invoice_no VARCHAR(100) NULL,
  memory VARCHAR(255) NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_due DECIMAL(12,2) NOT NULL DEFAULT 0,
  note TEXT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_invoice_customer (customer_id),
  INDEX idx_invoice_date (invoice_date),
  INDEX idx_invoice_no (invoice_no)
);
