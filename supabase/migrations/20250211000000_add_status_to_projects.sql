-- Add status column to projects for Finalize Project (freeze) feature.
-- Values: 'active' (default) | 'finalized'
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

COMMENT ON COLUMN projects.status IS 'active = editable; finalized = frozen (no new contributions, no edit/delete)';
