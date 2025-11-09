const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const handleDbError = (error, res, fallbackMessage) => {
  if (error && (error.sqlState?.startsWith('45') || error.errno === 1644)) {
    return res.status(400).json({ error: error.sqlMessage || error.message });
  }
  console.error(fallbackMessage, error);
  return res.status(500).json({ error: fallbackMessage, message: error.message });
};

// Create a new booking
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { courtId, slotId } = req.body;
  const ssrn = req.user.ssrn;

  if (!courtId || !slotId) {
    return res.status(400).json({ error: 'Court ID and Slot ID are required' });
  }

  try {
    const [results] = await pool.query('CALL sp_create_booking(?, ?, ?)', [ssrn, courtId, slotId]);
    const bookingRows = results && results[0] ? results[0] : [];
    const booking = bookingRows[0];

    if (!booking) {
      return res.status(201).json({ message: 'Booking created successfully' });
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    return handleDbError(error, res, 'Failed to create booking');
  }
});

// Get user's bookings
router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const ssrn = req.user.ssrn;

  try {
    const { status } = req.query;
    let query = `
      SELECT 
        b.Booking_ID,
        b.Booking_Date,
        b.Booking_Status,
        b.Total_Amount,
        b.Payment_Status,
        b.Cancellation_Date,
        b.Notes,
        c.Court_ID,
        c.Court_Name,
        c.Location,
        c.Hourly_Rate,
        s.Sport_Name,
        sl.Slot_ID,
        sl.Slot_Date,
        sl.Start_Time,
        sl.End_Time
      FROM Booking b
      JOIN Court c ON b.Court_ID = c.Court_ID
      JOIN Sport s ON c.Sport_ID = s.Sport_ID
      JOIN Slot sl ON b.Slot_ID = sl.Slot_ID
      WHERE b.SSRN = ?
    `;

    const params = [ssrn];

    if (status) {
      query += ' AND b.Booking_Status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.Booking_Date DESC';

    const [bookings] = await pool.execute(query, params);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', message: error.message });
  }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const ssrn = req.user.ssrn;

  try {
    const [bookings] = await pool.execute(
      `SELECT 
        b.Booking_ID,
        b.Booking_Date,
        b.Booking_Status,
        b.Total_Amount,
        b.Payment_Status,
        b.Cancellation_Date,
        b.Notes,
        c.Court_ID,
        c.Court_Name,
        c.Location,
        c.Hourly_Rate,
        s.Sport_Name,
        sl.Slot_ID,
        sl.Slot_Date,
        sl.Start_Time,
        sl.End_Time
      FROM Booking b
      JOIN Court c ON b.Court_ID = c.Court_ID
      JOIN Sport s ON c.Sport_ID = s.Sport_ID
      JOIN Slot sl ON b.Slot_ID = sl.Slot_ID
      WHERE b.Booking_ID = ? AND b.SSRN = ?`,
      [req.params.id, ssrn]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(bookings[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking', message: error.message });
  }
});

// Cancel booking
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const ssrn = req.user.ssrn;

  try {
    await pool.query('CALL sp_cancel_booking(?, ?)', [req.params.id, ssrn]);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    return handleDbError(error, res, 'Failed to cancel booking');
  }
});

// Mark payment as paid
router.put('/:id/pay', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const ssrn = req.user.ssrn;
  const { paymentMethod, transactionId } = req.body;

  if (!paymentMethod) {
    return res.status(400).json({ error: 'Payment method is required' });
  }

  try {
    await pool.query('CALL sp_record_payment(?, ?, ?, ?)', [req.params.id, ssrn, paymentMethod, transactionId || null]);
    res.json({ message: 'Payment recorded successfully' });
  } catch (error) {
    return handleDbError(error, res, 'Failed to process payment');
  }
});

// Confirm booking (update status to Confirmed)
router.put('/:id/confirm', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const ssrn = req.user.ssrn;

  try {
    await pool.query('CALL sp_confirm_booking(?, ?)', [req.params.id, ssrn]);
    res.json({ message: 'Booking confirmed successfully' });
  } catch (error) {
    return handleDbError(error, res, 'Failed to confirm booking');
  }
});

module.exports = router;

