-- Onboarding: first time a project is opened, Equity Settings modal opens on the Settings tab.
-- This flag is set to true when the user closes that modal (or has already seen it).
-- Existing rows get true so they don't see the popup; new projects get default false.
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS settings_onboarding_done BOOLEAN NOT NULL DEFAULT true;

-- New projects (created after this migration) should show onboarding once.
ALTER TABLE projects
ALTER COLUMN settings_onboarding_done SET DEFAULT false;
