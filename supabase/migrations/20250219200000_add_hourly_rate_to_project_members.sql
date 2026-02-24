-- Add hourly_rate (FMV) to project_members for WORK contributions by hours
-- Optional: used when calculating work value as hours * hourly_rate
ALTER TABLE project_members
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT NULL;
