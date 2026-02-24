-- Add currency to projects for display of all monetary values (EUR, GBP, USD, JPY, etc.)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'EUR';
