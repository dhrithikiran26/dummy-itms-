-- Sample Data for Sports Court Booking System
-- Use this file to populate the database with test data

USE sports_court_booking;

-- Insert Sports (IGNORE to prevent duplicate errors on re-run)
INSERT IGNORE INTO Sport (Sport_Name, Description) VALUES
('Basketball', 'Basketball court with standard dimensions and hoops'),
('Tennis', 'Tennis court with net and boundary lines'),
('Volleyball', 'Volleyball court with net and boundary markers'),
('Badminton', 'Indoor badminton court with net'),
('Football', 'Football field with goal posts'),
('Cricket', 'Cricket ground with pitch'),
('Table Tennis', 'Indoor table tennis facility');

-- Insert Staff (IGNORE to prevent duplicate errors on re-run)
INSERT IGNORE INTO Staff (Staff_Name, Email, Role, Reports_To) VALUES
('John Manager', 'john.manager@college.edu', 'Manager', NULL),
('Jane Coach', 'jane.coach@college.edu', 'Coach', 1),
('Bob Admin', 'bob.admin@college.edu', 'Admin', 1),
('Alice Supervisor', 'alice.supervisor@college.edu', 'Supervisor', 1);

-- Insert Staff Phone Numbers (IGNORE to prevent duplicate errors on re-run)
INSERT IGNORE INTO Staff_Phone (Staff_ID, Phone_Number, Phone_Type) VALUES
(1, '9876543210', 'Mobile'),
(1, '080-12345678', 'Office'),
(2, '9876543211', 'Mobile'),
(3, '9876543212', 'Mobile'),
(4, '9876543213', 'Mobile');

-- Insert Courts (IGNORE to prevent duplicate errors on re-run)
INSERT IGNORE INTO Court (Sport_ID, Court_Name, Sport_Type, Staff_ID, Location, Capacity, Hourly_Rate, Availability_Status) VALUES
(1, 'Basketball Court 1', 'Basketball', 1, 'Sports Complex A - Ground Floor', 20, 500.00, 'Active'),
(1, 'Basketball Court 2', 'Basketball', 1, 'Sports Complex A - Ground Floor', 20, 500.00, 'Active'),
(2, 'Tennis Court 1', 'Tennis', 2, 'Sports Complex A - Outdoor', 4, 800.00, 'Active'),
(2, 'Tennis Court 2', 'Tennis', 2, 'Sports Complex A - Outdoor', 4, 800.00, 'Active'),
(3, 'Volleyball Court 1', 'Volleyball', 2, 'Sports Complex B - Indoor', 12, 600.00, 'Active'),
(4, 'Badminton Court 1', 'Badminton', 4, 'Sports Complex B - Indoor Hall 1', 4, 400.00, 'Active'),
(4, 'Badminton Court 2', 'Badminton', 4, 'Sports Complex B - Indoor Hall 1', 4, 400.00, 'Active'),
(5, 'Football Field', 'Football', 3, 'Main Ground', 22, 1000.00, 'Active'),
(6, 'Cricket Ground', 'Cricket', 3, 'Main Ground - Outfield', 22, 1200.00, 'Active'),
(7, 'Table Tennis Room 1', 'Table Tennis', 4, 'Sports Complex B - Indoor Hall 2', 4, 300.00, 'Active'),
(7, 'Table Tennis Room 2', 'Table Tennis', 4, 'Sports Complex B - Indoor Hall 2', 4, 300.00, 'Active');

-- Insert Equipment (Weak Entity) (IGNORE to prevent duplicate errors on re-run)
INSERT IGNORE INTO Equipment (Court_ID, Sport_ID, Equipment_Name, Quantity, Condition_Status, Last_Maintenance_Date) VALUES
(1, 1, 'Basketball', 10, 'Good', '2024-01-15'),
(1, 1, 'Basketball Hoop Net', 4, 'Good', '2024-01-10'),
(3, 2, 'Tennis Balls', 20, 'Fair', '2024-01-20'),
(3, 2, 'Tennis Rackets', 8, 'Good', '2024-01-18'),
(5, 3, 'Volleyball', 6, 'Good', '2024-01-22'),
(6, 4, 'Badminton Rackets', 10, 'Good', '2024-01-25'),
(6, 4, 'Shuttlecocks', 24, 'Fair', '2024-01-25'),
(10, 7, 'Table Tennis Balls', 20, 'Good', '2024-01-28'),
(10, 7, 'Table Tennis Paddles', 8, 'Good', '2024-01-28');

-- Insert Sample Slots for the next 7 days
-- Note: This creates slots for each court from 9 AM to 6 PM, hourly slots
-- Date calculation: starting from today

INSERT IGNORE INTO Slot (Court_ID, Slot_Date, Start_Time, End_Time, Status)
SELECT 
    c.Court_ID,
    DATE_ADD(CURDATE(), INTERVAL d.day_offset DAY) as Slot_Date,
    TIME_FORMAT(SEC_TO_TIME(s.start_seconds), '%H:%i:%s') as Start_Time,
    TIME_FORMAT(SEC_TO_TIME(s.start_seconds + 3600), '%H:%i:%s') as End_Time,
    'Available' as Status
FROM Court c
CROSS JOIN (
    SELECT 0 as day_offset UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 
    UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
) d
CROSS JOIN (
    SELECT 32400 as start_seconds UNION SELECT 36000 UNION SELECT 39600 
    UNION SELECT 43200 UNION SELECT 46800 UNION SELECT 50400 
    UNION SELECT 54000 UNION SELECT 57600 UNION SELECT 61200
) s
WHERE c.Availability_Status = 'Active'
ORDER BY c.Court_ID, Slot_Date, Start_Time;

-- Insert Sample Student (for testing)
-- NOTE: For production, generate proper bcrypt hashes using:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('your_password', 10).then(hash => console.log(hash));
-- 
-- For now, please register new students through the UI instead of using these test accounts
-- These are just placeholders to show the structure
--
-- INSERT INTO Student (SSRN, First_Name, Last_Name, Email, Password_Hash, Department, Year, Date_of_Birth, Status) VALUES
-- ('SSRN001', 'Test', 'Student', 'test@student.college.edu', 'GENERATE_HASH_HERE', 'Computer Science', 2, '2003-05-15', 'Active');

-- Insert Student Phone Numbers (uncomment when student is created)
-- INSERT INTO Student_Phone (SSRN, Phone_Number, Phone_Type) VALUES
-- ('SSRN001', '9876543200', 'Mobile');

-- Recommendation: Register students through the UI at /register

