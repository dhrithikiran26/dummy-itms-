-- Sports Court Booking System Database Schema
-- Create database first: CREATE DATABASE sports_court_booking;

USE sports_court_booking;

-- Sport table (Strong Entity)
CREATE TABLE IF NOT EXISTS Sport (
    Sport_ID INT PRIMARY KEY AUTO_INCREMENT,
    Sport_Name VARCHAR(50) NOT NULL UNIQUE,
    Description TEXT
);

-- Staff table (Strong Entity)
CREATE TABLE IF NOT EXISTS Staff (
    Staff_ID INT PRIMARY KEY AUTO_INCREMENT,
    Staff_Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    Role ENUM('Manager', 'Coach', 'Admin', 'Supervisor') DEFAULT 'Admin',
    Reports_To INT,
    FOREIGN KEY (Reports_To) REFERENCES Staff(Staff_ID)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- Staff_Phone table (Weak Entity - depends on Staff)
CREATE TABLE IF NOT EXISTS Staff_Phone (
    Staff_ID INT NOT NULL,
    Phone_Number VARCHAR(15) NOT NULL,
    Phone_Type ENUM('Mobile', 'Office', 'Emergency') DEFAULT 'Mobile',
    PRIMARY KEY (Staff_ID, Phone_Number),
    FOREIGN KEY (Staff_ID) REFERENCES Staff(Staff_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Court table (Strong Entity)
CREATE TABLE IF NOT EXISTS Court (
    Court_ID INT PRIMARY KEY AUTO_INCREMENT,
    Sport_ID INT NOT NULL,
    Court_Name VARCHAR(100) NOT NULL,
    Sport_Type VARCHAR(100),
    Staff_ID INT NOT NULL,
    Location VARCHAR(100) NOT NULL,
    Capacity INT NOT NULL CHECK (Capacity > 0),
    Hourly_Rate DECIMAL(8,2) DEFAULT 0.00,
    Availability_Status ENUM('Active', 'Inactive', 'Under Maintenance') DEFAULT 'Active',
    FOREIGN KEY (Sport_ID) REFERENCES Sport(Sport_ID)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Staff_ID) REFERENCES Staff(Staff_ID)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Student table (Strong Entity)
CREATE TABLE IF NOT EXISTS Student (
    SSRN VARCHAR(20) PRIMARY KEY,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password_Hash VARCHAR(255) NOT NULL,
    Department VARCHAR(50) NOT NULL,
    Year INT NOT NULL CHECK (Year BETWEEN 1 AND 4),
    Date_of_Birth DATE NOT NULL,
    Registration_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active', 'Suspended', 'Graduated') DEFAULT 'Active'
);

-- Student_Phone table (Weak Entity - depends on Student)
CREATE TABLE IF NOT EXISTS Student_Phone (
    SSRN VARCHAR(20) NOT NULL,
    Phone_Number VARCHAR(15) NOT NULL,
    Phone_Type ENUM('Mobile', 'Home', 'Emergency') DEFAULT 'Mobile',
    PRIMARY KEY (SSRN, Phone_Number),
    FOREIGN KEY (SSRN) REFERENCES Student(SSRN)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Slot table (Strong Entity)
CREATE TABLE IF NOT EXISTS Slot (
    Slot_ID INT PRIMARY KEY AUTO_INCREMENT,
    Court_ID INT NOT NULL,
    Slot_Date DATE NOT NULL,
    Start_Time TIME NOT NULL,
    End_Time TIME NOT NULL,
    Status ENUM('Available', 'Booked', 'Blocked') DEFAULT 'Available',
    CHECK (End_Time > Start_Time),
    UNIQUE (Court_ID, Slot_Date, Start_Time, End_Time),
    FOREIGN KEY (Court_ID) REFERENCES Court(Court_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Booking table (Strong Entity)
CREATE TABLE IF NOT EXISTS Booking (
    Booking_ID INT PRIMARY KEY AUTO_INCREMENT,
    SSRN VARCHAR(20) NOT NULL,
    Court_ID INT NOT NULL,
    Slot_ID INT NOT NULL,
    Booking_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Booking_Status ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed', 'No-Show') DEFAULT 'Pending',
    Total_Amount DECIMAL(8,2) DEFAULT 0.00,
    Payment_Status ENUM('Unpaid', 'Paid', 'Refunded') DEFAULT 'Unpaid',
    Cancellation_Date TIMESTAMP NULL,
    Notes TEXT,
    FOREIGN KEY (SSRN) REFERENCES Student(SSRN)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Court_ID) REFERENCES Court(Court_ID)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Slot_ID) REFERENCES Slot(Slot_ID)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Equipment table (Weak Entity - depends on Court and Sport)
CREATE TABLE IF NOT EXISTS Equipment (
    Equipment_ID INT AUTO_INCREMENT,
    Court_ID INT NOT NULL,
    Sport_ID INT NOT NULL,
    Equipment_Name VARCHAR(100) NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity >= 0),
    Condition_Status ENUM('Good', 'Fair', 'Poor', 'Damaged') DEFAULT 'Good',
    Last_Maintenance_Date DATE,
    PRIMARY KEY (Equipment_ID, Court_ID, Sport_ID),
    FOREIGN KEY (Court_ID) REFERENCES Court(Court_ID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Sport_ID) REFERENCES Sport(Sport_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Usage_History table (Strong Entity)
CREATE TABLE IF NOT EXISTS Usage_History (
    Usage_ID INT PRIMARY KEY AUTO_INCREMENT,
    SSRN VARCHAR(20) NOT NULL,
    Court_ID INT NOT NULL,
    Slot_ID INT NOT NULL,
    Usage_Date DATE NOT NULL,
    Duration_Minutes INT,
    FOREIGN KEY (SSRN) REFERENCES Student(SSRN)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Court_ID) REFERENCES Court(Court_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Payment table (Strong Entity)
CREATE TABLE IF NOT EXISTS Payment (
    Payment_ID INT PRIMARY KEY AUTO_INCREMENT,
    Booking_ID INT NOT NULL,
    Amount DECIMAL(8,2) NOT NULL,
    Payment_Method ENUM('Cash', 'Card', 'UPI', 'Wallet') NOT NULL,
    Payment_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Transaction_ID VARCHAR(100) UNIQUE,
    FOREIGN KEY (Booking_ID) REFERENCES Booking(Booking_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for better performance
DROP INDEX IF EXISTS idx_booking_ssrn ON Booking;
DROP INDEX IF EXISTS idx_booking_court ON Booking;
DROP INDEX IF EXISTS idx_booking_status ON Booking;
DROP INDEX IF EXISTS idx_slot_court_date ON Slot;
DROP INDEX IF EXISTS idx_court_sport ON Court;
DROP INDEX IF EXISTS idx_court_status ON Court;

CREATE INDEX idx_booking_ssrn ON Booking(SSRN);
CREATE INDEX idx_booking_court ON Booking(Court_ID);
CREATE INDEX idx_booking_status ON Booking(Booking_Status);
CREATE INDEX idx_slot_court_date ON Slot(Court_ID, Slot_Date);
CREATE INDEX idx_court_sport ON Court(Sport_ID);
CREATE INDEX idx_court_status ON Court(Availability_Status);

-- Stored routines and triggers
DELIMITER $$

DROP FUNCTION IF EXISTS fn_slot_duration_hours $$
CREATE FUNCTION fn_slot_duration_hours(p_start TIME, p_end TIME)
RETURNS DECIMAL(8,2)
DETERMINISTIC
BEGIN
    RETURN TIMESTAMPDIFF(MINUTE, CONCAT('1970-01-01 ', p_start), CONCAT('1970-01-01 ', p_end)) / 60;
END $$

DROP PROCEDURE IF EXISTS sp_create_booking $$
CREATE PROCEDURE sp_create_booking(
    IN p_ssrn VARCHAR(20),
    IN p_court_id INT,
    IN p_slot_id INT
)
BEGIN
    DECLARE v_slot_status ENUM('Available','Booked','Blocked');
    DECLARE v_slot_court INT;
    DECLARE v_court_status ENUM('Active','Inactive','Under Maintenance');
    DECLARE v_hourly_rate DECIMAL(8,2);
    DECLARE v_start_time TIME;
    DECLARE v_end_time TIME;
    DECLARE v_total_amount DECIMAL(8,2);
    DECLARE v_booking_id INT;

    DECLARE exit handler FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT Status, Court_ID, Start_Time, End_Time
    INTO v_slot_status, v_slot_court, v_start_time, v_end_time
    FROM Slot
    WHERE Slot_ID = p_slot_id
    FOR UPDATE;

    IF v_slot_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Slot not found';
    END IF;

    IF v_slot_status <> 'Available' THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Slot is not available';
    END IF;

    IF v_slot_court <> p_court_id THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'Slot does not belong to the specified court';
    END IF;

    SELECT Availability_Status, Hourly_Rate
    INTO v_court_status, v_hourly_rate
    FROM Court
    WHERE Court_ID = p_court_id
    FOR UPDATE;

    IF v_court_status IS NULL THEN
        SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Court not found';
    END IF;

    IF v_court_status <> 'Active' THEN
        SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'Court is not available for booking';
    END IF;

    SET v_total_amount = fn_slot_duration_hours(v_start_time, v_end_time) * IFNULL(v_hourly_rate, 0);

    INSERT INTO Booking (SSRN, Court_ID, Slot_ID, Booking_Status, Total_Amount, Payment_Status)
    VALUES (p_ssrn, p_court_id, p_slot_id, 'Pending', v_total_amount, 'Unpaid');
    SET v_booking_id = LAST_INSERT_ID();

    UPDATE Slot
    SET Status = 'Booked'
    WHERE Slot_ID = p_slot_id;

    COMMIT;

    SELECT 
        b.Booking_ID,
        b.Booking_Date,
        b.Booking_Status,
        b.Total_Amount,
        b.Payment_Status,
        c.Court_Name,
        c.Location,
        s.Slot_Date,
        s.Start_Time,
        s.End_Time
    FROM Booking b
    JOIN Court c ON b.Court_ID = c.Court_ID
    JOIN Slot s ON b.Slot_ID = s.Slot_ID
    WHERE b.Booking_ID = v_booking_id;
END $$

DROP PROCEDURE IF EXISTS sp_cancel_booking $$
CREATE PROCEDURE sp_cancel_booking(
    IN p_booking_id INT,
    IN p_ssrn VARCHAR(20)
)
BEGIN
    DECLARE v_status ENUM('Pending','Confirmed','Cancelled','Completed','No-Show');
    DECLARE v_slot_id INT;

    DECLARE exit handler FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT Booking_Status, Slot_ID
    INTO v_status, v_slot_id
    FROM Booking
    WHERE Booking_ID = p_booking_id AND SSRN = p_ssrn
    FOR UPDATE;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking not found';
    END IF;

    IF v_status = 'Cancelled' THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Booking already cancelled';
    END IF;

    IF v_status = 'Completed' THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'Completed booking cannot be cancelled';
    END IF;

    UPDATE Booking
    SET Booking_Status = 'Cancelled',
        Cancellation_Date = CURRENT_TIMESTAMP
    WHERE Booking_ID = p_booking_id;

    UPDATE Slot
    SET Status = 'Available'
    WHERE Slot_ID = v_slot_id;

    COMMIT;
END $$

DROP PROCEDURE IF EXISTS sp_record_payment $$
CREATE PROCEDURE sp_record_payment(
    IN p_booking_id INT,
    IN p_ssrn VARCHAR(20),
    IN p_payment_method ENUM('Cash','Card','UPI','Wallet'),
    IN p_transaction_id VARCHAR(100)
)
BEGIN
    DECLARE v_amount DECIMAL(8,2);
    DECLARE v_status ENUM('Pending','Confirmed','Cancelled','Completed','No-Show');
    DECLARE v_payment_status ENUM('Unpaid','Paid','Refunded');

    DECLARE exit handler FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT Total_Amount, Booking_Status, Payment_Status
    INTO v_amount, v_status, v_payment_status
    FROM Booking
    WHERE Booking_ID = p_booking_id AND SSRN = p_ssrn
    FOR UPDATE;

    IF v_amount IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking not found';
    END IF;

    IF v_payment_status = 'Paid' THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Booking already marked as paid';
    END IF;

    IF v_status = 'Cancelled' THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'Cannot pay for a cancelled booking';
    END IF;

    INSERT INTO Payment (Booking_ID, Amount, Payment_Method, Transaction_ID)
    VALUES (p_booking_id, v_amount, p_payment_method, p_transaction_id);

    UPDATE Booking
    SET Payment_Status = 'Paid'
    WHERE Booking_ID = p_booking_id;

    COMMIT;
END $$

DROP PROCEDURE IF EXISTS sp_confirm_booking $$
CREATE PROCEDURE sp_confirm_booking(
    IN p_booking_id INT,
    IN p_ssrn VARCHAR(20)
)
BEGIN
    DECLARE v_status ENUM('Pending','Confirmed','Cancelled','Completed','No-Show');
    DECLARE v_payment_status ENUM('Unpaid','Paid','Refunded');

    UPDATE Booking
    SET Booking_Status = Booking_Status
    WHERE Booking_ID = p_booking_id;

    SELECT Booking_Status, Payment_Status
    INTO v_status, v_payment_status
    FROM Booking
    WHERE Booking_ID = p_booking_id AND SSRN = p_ssrn;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking not found';
    END IF;

    IF v_status = 'Cancelled' THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Cancelled booking cannot be confirmed';
    END IF;

    IF v_status = 'Completed' THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'Completed booking cannot be confirmed';
    END IF;

    UPDATE Booking
    SET Booking_Status = 'Confirmed'
    WHERE Booking_ID = p_booking_id;
END $$

DROP TRIGGER IF EXISTS trg_payment_after_insert $$
CREATE TRIGGER trg_payment_after_insert
AFTER INSERT ON Payment
FOR EACH ROW
BEGIN
    UPDATE Booking
    SET Payment_Status = 'Paid'
    WHERE Booking_ID = NEW.Booking_ID;
END $$

DROP TRIGGER IF EXISTS trg_booking_complete_usage $$
CREATE TRIGGER trg_booking_complete_usage
AFTER UPDATE ON Booking
FOR EACH ROW
BEGIN
    IF NEW.Booking_Status = 'Completed' AND OLD.Booking_Status <> 'Completed' THEN
        INSERT INTO Usage_History (SSRN, Court_ID, Slot_ID, Usage_Date, Duration_Minutes)
        SELECT NEW.SSRN, NEW.Court_ID, NEW.Slot_ID, CURRENT_DATE,
               TIMESTAMPDIFF(MINUTE, CONCAT('1970-01-01 ', s.Start_Time), CONCAT('1970-01-01 ', s.End_Time))
        FROM Slot s
        WHERE s.Slot_ID = NEW.Slot_ID;
    END IF;
END $$

DELIMITER ;




