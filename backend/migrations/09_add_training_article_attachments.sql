ALTER TABLE training_articles
ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE training_articles
SET attachments = jsonb_build_array(
  jsonb_build_object(
    'url',
    attachment_url,
    'name',
    COALESCE(NULLIF(TRIM(attachment_name), ''), 'Attachment')
  )
)
WHERE (attachments IS NULL OR attachments = '[]'::jsonb)
  AND attachment_url IS NOT NULL
  AND NULLIF(TRIM(attachment_url), '') IS NOT NULL;
