-- Migration: Update roles from 'seller' to 'entrepreneur' and fix listing status
-- Run this migration before deploying the updated application

-- 1. Update existing users with 'seller' role to 'entrepreneur'
UPDATE users 
SET role = 'entrepreneur' 
WHERE role = 'seller';

-- 2. Drop and recreate the role constraint to use 'entrepreneur'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('investor', 'entrepreneur', 'admin'));

-- 3. Update existing listings with 'draft' status to 'pending_review'
UPDATE listings 
SET status = 'pending_review' 
WHERE status = 'draft';

-- 4. Rename seller_id column to entrepreneur_id for clarity (optional but recommended)
-- Note: This requires updating all foreign key references
-- ALTER TABLE listings RENAME COLUMN seller_id TO entrepreneur_id;
-- ALTER TABLE investments RENAME COLUMN seller_id TO entrepreneur_id;
-- ALTER TABLE inquiries RENAME COLUMN seller_id TO entrepreneur_id;
-- ALTER TABLE analytics RENAME COLUMN seller_id TO entrepreneur_id;

-- 5. Ensure all listings have proper timestamps
UPDATE listings 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL;

-- 6. Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_entrepreneur ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 7. Update listing status default for new records
ALTER TABLE listings ALTER COLUMN status SET DEFAULT 'pending_review';

-- Verify migration
SELECT 'Users by role:' as info;
SELECT role, COUNT(*) as count FROM users GROUP BY role;

SELECT 'Listings by status:' as info;
SELECT status, COUNT(*) as count FROM listings GROUP BY status;
