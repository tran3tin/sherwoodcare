CREATE TABLE IF NOT EXISTS training_articles (
  article_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  attachment_url TEXT,
  attachment_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_training_articles_created_at
  ON training_articles(created_at DESC);
