-- Add model_onboarding_dismissed to projects: true for existing projects, false for new ones.
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS model_onboarding_dismissed BOOLEAN NOT NULL DEFAULT true;
