-- Create social_sheets table (PostgreSQL)
CREATE TABLE IF NOT EXISTS social_sheets (
  sheet_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NULL,
  rows_json TEXT NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_social_sheets_created ON social_sheets(created_at);
