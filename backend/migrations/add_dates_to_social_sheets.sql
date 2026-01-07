-- Add start_date and end_date columns to social_sheets table
ALTER TABLE social_sheets 
ADD COLUMN start_date DATE NULL AFTER name,
ADD COLUMN end_date DATE NULL AFTER start_date;
