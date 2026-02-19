-- Add stripe_subscription_id to track if project ever had a subscription (for trial logic on reactivation)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
