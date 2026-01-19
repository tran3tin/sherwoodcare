CREATE TABLE IF NOT EXISTS task_attachments (
    attachment_id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(task_id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing data (only if not already migrated to avoid duplicates on re-run)
-- We use a simple check: if table is empty, try to fill it from tasks
INSERT INTO task_attachments (task_id, file_url, file_name)
SELECT task_id, attachment_url, attachment_name
FROM tasks
WHERE attachment_url IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM task_attachments);
