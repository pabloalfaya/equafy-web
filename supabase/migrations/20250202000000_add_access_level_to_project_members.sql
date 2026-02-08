-- Add access_level column to project_members for RBAC
-- Run this in the Supabase SQL Editor if you don't use migrations

-- Add access_level: 'editor' (can edit) | 'viewer' (view only)
-- Default 'editor' for existing members so nothing breaks
ALTER TABLE project_members
ADD COLUMN IF NOT EXISTS access_level TEXT NOT NULL DEFAULT 'editor';
