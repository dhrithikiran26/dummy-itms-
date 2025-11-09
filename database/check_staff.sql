-- Quick script to check if staff data exists
-- Run this to verify staff emails are in the database

USE sports_court_booking;

-- Check if Staff table has data
SELECT 
    Staff_ID,
    Staff_Name,
    Email,
    Role
FROM Staff;

-- Count staff members
SELECT COUNT(*) as Staff_Count FROM Staff;

-- List all staff emails
SELECT Email, Staff_Name, Role FROM Staff ORDER BY Email;




