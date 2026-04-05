-- Add category to tasks for filtering (e.g. Investments, Personal, Home)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT;
