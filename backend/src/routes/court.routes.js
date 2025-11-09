const express = require('express');
const router = express.Router();

// Get all courts with sport and staff info
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { sportId, status } = req.query;
    let query = `
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
    `;
    const params = [];

    if (sportId) {
      query += ' WHERE c.Sport_ID = ?';
      params.push(sportId);
      if (status) {
        query += ' AND c.Availability_Status = ?';
        params.push(status);
      }
    } else if (status) {
      query += ' WHERE c.Availability_Status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.Court_Name';

    const [courts] = await pool.execute(query, params);
    res.json(courts);
  } catch (error) {
    console.error('Error fetching courts:', error);
    res.status(500).json({ error: 'Failed to fetch courts', message: error.message });
  }
});

// Get court by ID
router.get('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [courts] = await pool.execute(
      `SELECT 
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
      WHERE c.Court_ID = ?`,
      [req.params.id]
    );

    if (courts.length === 0) {
      return res.status(404).json({ error: 'Court not found' });
    }

    res.json(courts[0]);
  } catch (error) {
    console.error('Error fetching court:', error);
    res.status(500).json({ error: 'Failed to fetch court', message: error.message });
  }
});

// Get available slots for a court on a specific date
router.get('/:id/slots', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const [slots] = await pool.execute(
      `SELECT 
        Slot_ID,
        Slot_Date,
        Start_Time,
        End_Time,
        Status
      FROM Slot
      WHERE Court_ID = ? AND Slot_Date = ? AND Status = 'Available'
      ORDER BY Start_Time`,
      [req.params.id, date]
    );

    res.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Failed to fetch slots', message: error.message });
  }
});

module.exports = router;




