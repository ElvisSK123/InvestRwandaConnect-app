-- Create Admin User Script
-- Run this to create an admin account for testing the Admin Portal

-- First, check if admin user already exists
SELECT id, full_name, email, role 
FROM users 
WHERE email = 'admin@investrwanda.com';

-- If no admin exists, create one
-- Note: You'll need to register through the UI first, then update the role
-- OR use this to directly insert (password is 'admin123' - CHANGE IN PRODUCTION!)

-- Option 1: Update existing user to admin role
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';  -- Replace with actual email

-- Option 2: Insert new admin user with bcrypt hashed password
-- Password: 'admin123' (hashed with bcrypt, 10 rounds)
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO users (full_name, email, password_hash, role)
VALUES (
    'Admin User',
    'admin@investrwanda.com',
    '$2b$10$rQJ5qKzK5zK5qKzK5zK5qO7Kz5qKzK5zK5qKzK5zK5qKzK5zK5qKz',  -- This is just a placeholder
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Verify admin was created/updated
SELECT id, full_name, email, role, created_at 
FROM users 
WHERE role = 'admin';

-- Show all user roles
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
