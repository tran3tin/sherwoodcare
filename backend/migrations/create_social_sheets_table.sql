-- Create social_sheets table
CREATE TABLE IF NOT EXISTS social_sheets (
  sheet_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NULL,
  rows_json LONGTEXT NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_social_sheets_created (created_at)
);
