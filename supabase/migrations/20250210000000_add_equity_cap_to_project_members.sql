-- Add equity_cap column to project_members for Limited Equity (hard cap)
-- Run this in the Supabase SQL Editor if you don't use migrations

-- equity_cap: max % a member can receive; NULL = no cap
ALTER TABLE project_members
ADD COLUMN IF NOT EXISTS equity_cap NUMERIC DEFAULT NULL;
