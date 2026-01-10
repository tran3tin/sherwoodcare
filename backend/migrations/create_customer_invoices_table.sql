-- Create customer_invoices table (PostgreSQL)
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
