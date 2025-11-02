const express = require('express');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

// Middleware to check admin role
const checkAdmin = authenticateAdmin;

// Get dashboard stats
router.get('/dashboard', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM Booking WHERE Booking_Status = 'Confirmed') as confirmed_bookings,
        (SELECT COUNT(*) FROM Booking WHERE Booking_Status = 'Pending') as pending_bookings,
        (SELECT COUNT(*) FROM Booking WHERE Booking_Status = 'Cancelled') as cancelled_bookings,
        (SELECT COUNT(*) FROM Booking WHERE Booking_Status = 'Completed') as completed_bookings,
        (SELECT COUNT(*) FROM Court WHERE Availability_Status = 'Active') as active_courts,
        (SELECT COUNT(*) FROM Student WHERE Status = 'Active') as active_students,
        (SELECT SUM(Total_Amount) FROM Booking WHERE Payment_Status = 'Paid') as total_revenue,
        (SELECT COUNT(*) FROM Slot WHERE Status = 'Available') as available_slots,
        (SELECT COUNT(*) FROM Slot WHERE Status = 'Booked') as booked_slots
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats', message: error.message });
  }
});

// Get all bookings (admin view)
router.get('/bookings', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { status, date } = req.query;
    let query = `
      SELECT 
        b.Booking_ID,
        b.Booking_Date,
        b.Booking_Status,
        b.Total_Amount,
        b.Payment_Status,
        b.Cancellation_Date,
        st.SSRN,
        st.First_Name,
        st.Last_Name,
        st.Email,
        c.Court_ID,
        c.Court_Name,
        c.Location,
        s.Sport_Name,
        sl.Slot_Date,
        sl.Start_Time,
        sl.End_Time
      FROM Booking b
      JOIN Student st ON b.SSRN = st.SSRN
      JOIN Court c ON b.Court_ID = c.Court_ID
      JOIN Sport s ON c.Sport_ID = s.Sport_ID
      JOIN Slot sl ON b.Slot_ID = sl.Slot_ID
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ' AND b.Booking_Status = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND sl.Slot_Date = ?';
      params.push(date);
    }

    query += ' ORDER BY b.Booking_Date DESC';

    const [bookings] = await pool.execute(query, params);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', message: error.message });
  }
});

// ========== COURT MANAGEMENT ==========

// Get all courts
router.get('/courts', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [courts] = await pool.execute(`
      SELECT 
        c.Court_ID,
        c.Court_Name,
        c.Sport_Type,
        c.Location,
        c.Capacity,
        c.Hourly_Rate,
        c.Availability_Status,
        s.Sport_ID,
        s.Sport_Name,
        st.Staff_ID,
        st.Staff_Name,
        st.Role
      FROM Court c
      JOIN Sport s ON c.Sport_ID = s.Sport_ID
      JOIN Staff st ON c.Staff_ID = st.Staff_ID
      ORDER BY c.Court_Name
    `);
    res.json(courts);
  } catch (error) {
    console.error('Error fetching courts:', error);
    res.status(500).json({ error: 'Failed to fetch courts', message: error.message });
  }
});

// Create new court
router.post('/courts', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { sportId, courtName, sportType, staffId, location, capacity, hourlyRate, availabilityStatus } = req.body;

  try {
    if (!sportId || !courtName || !staffId || !location || !capacity) {
      return res.status(400).json({ error: 'Required fields: sportId, courtName, staffId, location, capacity' });
    }

    const [result] = await pool.execute(
      `INSERT INTO Court (Sport_ID, Court_Name, Sport_Type, Staff_ID, Location, Capacity, Hourly_Rate, Availability_Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sportId, courtName, sportType || null, staffId, location, capacity, hourlyRate || 0, availabilityStatus || 'Active']
    );

    const [court] = await pool.execute(`
      SELECT 
        c.Court_ID,
        c.Court_Name,
        c.Sport_Type,
        c.Location,
        c.Capacity,
        c.Hourly_Rate,
        c.Availability_Status,
        s.Sport_Name,
        st.Staff_Name
      FROM Court c
      JOIN Sport s ON c.Sport_ID = s.Sport_ID
      JOIN Staff st ON c.Staff_ID = st.Staff_ID
      WHERE c.Court_ID = ?
    `, [result.insertId]);

    res.status(201).json({ message: 'Court created successfully', court: court[0] });
  } catch (error) {
    console.error('Error creating court:', error);
    res.status(500).json({ error: 'Failed to create court', message: error.message });
  }
});

// Update court
router.put('/courts/:id', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { sportId, courtName, sportType, staffId, location, capacity, hourlyRate, availabilityStatus } = req.body;

  try {
    await pool.execute(
      `UPDATE Court 
       SET Sport_ID = ?, Court_Name = ?, Sport_Type = ?, Staff_ID = ?, 
           Location = ?, Capacity = ?, Hourly_Rate = ?, Availability_Status = ?
       WHERE Court_ID = ?`,
      [sportId, courtName, sportType, staffId, location, capacity, hourlyRate, availabilityStatus, req.params.id]
    );

    res.json({ message: 'Court updated successfully' });
  } catch (error) {
    console.error('Error updating court:', error);
    res.status(500).json({ error: 'Failed to update court', message: error.message });
  }
});

// Delete court
router.delete('/courts/:id', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    // Check if court has active bookings
    const [bookings] = await pool.execute(
      'SELECT COUNT(*) as count FROM Booking WHERE Court_ID = ? AND Booking_Status IN ("Pending", "Confirmed")',
      [req.params.id]
    );

    if (bookings[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete court with active bookings' });
    }

    await pool.execute('DELETE FROM Court WHERE Court_ID = ?', [req.params.id]);
    res.json({ message: 'Court deleted successfully' });
  } catch (error) {
    console.error('Error deleting court:', error);
    res.status(500).json({ error: 'Failed to delete court', message: error.message });
  }
});

// ========== SPORT MANAGEMENT ==========

// Get all sports
router.get('/sports', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [sports] = await pool.execute('SELECT * FROM Sport ORDER BY Sport_Name');
    res.json(sports);
  } catch (error) {
    console.error('Error fetching sports:', error);
    res.status(500).json({ error: 'Failed to fetch sports', message: error.message });
  }
});

// Create sport
router.post('/sports', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { sportName, description } = req.body;

  try {
    if (!sportName) {
      return res.status(400).json({ error: 'Sport name is required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO Sport (Sport_Name, Description) VALUES (?, ?)',
      [sportName, description || null]
    );

    const [sport] = await pool.execute('SELECT * FROM Sport WHERE Sport_ID = ?', [result.insertId]);
    res.status(201).json({ message: 'Sport created successfully', sport: sport[0] });
  } catch (error) {
    console.error('Error creating sport:', error);
    res.status(500).json({ error: 'Failed to create sport', message: error.message });
  }
});

// Update sport
router.put('/sports/:id', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { sportName, description } = req.body;

  try {
    await pool.execute(
      'UPDATE Sport SET Sport_Name = ?, Description = ? WHERE Sport_ID = ?',
      [sportName, description, req.params.id]
    );

    res.json({ message: 'Sport updated successfully' });
  } catch (error) {
    console.error('Error updating sport:', error);
    res.status(500).json({ error: 'Failed to update sport', message: error.message });
  }
});

// Delete sport
router.delete('/sports/:id', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    // Check if sport has courts
    const [courts] = await pool.execute('SELECT COUNT(*) as count FROM Court WHERE Sport_ID = ?', [req.params.id]);

    if (courts[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete sport with associated courts' });
    }

    await pool.execute('DELETE FROM Sport WHERE Sport_ID = ?', [req.params.id]);
    res.json({ message: 'Sport deleted successfully' });
  } catch (error) {
    console.error('Error deleting sport:', error);
    res.status(500).json({ error: 'Failed to delete sport', message: error.message });
  }
});

// ========== STAFF MANAGEMENT ==========

// Get all staff
router.get('/staff', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [staff] = await pool.execute(`
      SELECT 
        s.Staff_ID,
        s.Staff_Name,
        s.Email,
        s.Role,
        s.Reports_To,
        m.Staff_Name as Reports_To_Name
      FROM Staff s
      LEFT JOIN Staff m ON s.Reports_To = m.Staff_ID
      ORDER BY s.Staff_Name
    `);
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff', message: error.message });
  }
});

// Create staff
router.post('/staff', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { staffName, email, role, reportsTo } = req.body;

  try {
    if (!staffName || !email) {
      return res.status(400).json({ error: 'Staff name and email are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO Staff (Staff_Name, Email, Role, Reports_To) VALUES (?, ?, ?, ?)',
      [staffName, email, role || 'Admin', reportsTo || null]
    );

    const [staff] = await pool.execute('SELECT * FROM Staff WHERE Staff_ID = ?', [result.insertId]);
    res.status(201).json({ message: 'Staff created successfully', staff: staff[0] });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: 'Failed to create staff', message: error.message });
  }
});

// Update staff
router.put('/staff/:id', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { staffName, email, role, reportsTo } = req.body;

  try {
    await pool.execute(
      'UPDATE Staff SET Staff_Name = ?, Email = ?, Role = ?, Reports_To = ? WHERE Staff_ID = ?',
      [staffName, email, role, reportsTo || null, req.params.id]
    );

    res.json({ message: 'Staff updated successfully' });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: 'Failed to update staff', message: error.message });
  }
});

// Delete staff
router.delete('/staff/:id', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    // Check if staff manages any courts
    const [courts] = await pool.execute('SELECT COUNT(*) as count FROM Court WHERE Staff_ID = ?', [req.params.id]);

    if (courts[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete staff member who manages courts' });
    }

    await pool.execute('DELETE FROM Staff WHERE Staff_ID = ?', [req.params.id]);
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: 'Failed to delete staff', message: error.message });
  }
});

// ========== SLOT MANAGEMENT ==========

// Get slots for a court
router.get('/courts/:id/slots', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { date } = req.query;

  try {
    let query = `
      SELECT Slot_ID, Slot_Date, Start_Time, End_Time, Status
      FROM Slot
      WHERE Court_ID = ?
    `;
    const params = [req.params.id];

    if (date) {
      query += ' AND Slot_Date = ?';
      params.push(date);
    }

    query += ' ORDER BY Slot_Date, Start_Time';

    const [slots] = await pool.execute(query, params);
    res.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Failed to fetch slots', message: error.message });
  }
});

// Create slots for a court
router.post('/courts/:id/slots', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { slotDate, startTime, endTime, status } = req.body;

  try {
    if (!slotDate || !startTime || !endTime) {
      return res.status(400).json({ error: 'Slot date, start time, and end time are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO Slot (Court_ID, Slot_Date, Start_Time, End_Time, Status)
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, slotDate, startTime, endTime, status || 'Available']
    );

    const [slot] = await pool.execute('SELECT * FROM Slot WHERE Slot_ID = ?', [result.insertId]);
    res.status(201).json({ message: 'Slot created successfully', slot: slot[0] });
  } catch (error) {
    console.error('Error creating slot:', error);
    res.status(500).json({ error: 'Failed to create slot', message: error.message });
  }
});

// Update slot
router.put('/slots/:id', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { slotDate, startTime, endTime, status } = req.body;

  try {
    await pool.execute(
      'UPDATE Slot SET Slot_Date = ?, Start_Time = ?, End_Time = ?, Status = ? WHERE Slot_ID = ?',
      [slotDate, startTime, endTime, status, req.params.id]
    );

    res.json({ message: 'Slot updated successfully' });
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ error: 'Failed to update slot', message: error.message });
  }
});

// Delete slot
router.delete('/slots/:id', checkAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    // Check if slot has booking
    const [bookings] = await pool.execute(
      'SELECT COUNT(*) as count FROM Booking WHERE Slot_ID = ? AND Booking_Status != "Cancelled"',
      [req.params.id]
    );

    if (bookings[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete slot with active booking' });
    }

    await pool.execute('DELETE FROM Slot WHERE Slot_ID = ?', [req.params.id]);
    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting slot:', error);
    res.status(500).json({ error: 'Failed to delete slot', message: error.message });
  }
});

module.exports = router;
