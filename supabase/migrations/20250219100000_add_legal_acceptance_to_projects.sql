-- Add legal acceptance timestamps to projects for audit trail
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ DEFAULT NULL;
