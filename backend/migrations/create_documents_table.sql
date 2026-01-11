-- Create documents table for storing uploaded files metadata
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Add comments
COMMENT ON TABLE documents IS 'Stores metadata for files uploaded to Firebase Storage';
COMMENT ON COLUMN documents.name IS 'Original file name';
COMMENT ON COLUMN documents.file_url IS 'Public URL from Firebase Storage';
