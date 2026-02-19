-- Add is_setup_completed to projects: false for new projects (onboarding not done), true for existing.
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS is_setup_completed BOOLEAN NOT NULL DEFAULT true;
