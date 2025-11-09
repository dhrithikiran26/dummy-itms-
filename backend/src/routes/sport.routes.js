const express = require('express');
const router = express.Router();

// Get all sports
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [sports] = await pool.execute(
      'SELECT Sport_ID, Sport_Name, Description FROM Sport ORDER BY Sport_Name'
    );
    res.json(sports);
  } catch (error) {
    console.error('Error fetching sports:', error);
    res.status(500).json({ error: 'Failed to fetch sports', message: error.message });
  }
});

// Get sport by ID
router.get('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [sports] = await pool.execute(
      'SELECT Sport_ID, Sport_Name, Description FROM Sport WHERE Sport_ID = ?',
      [req.params.id]
    );

    if (sports.length === 0) {
      return res.status(404).json({ error: 'Sport not found' });
    }

    res.json(sports[0]);
  } catch (error) {
    console.error('Error fetching sport:', error);
    res.status(500).json({ error: 'Failed to fetch sport', message: error.message });
  }
});

module.exports = router;




