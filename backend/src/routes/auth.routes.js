const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Register new student
router.post('/register', async (req, res) => {
  const pool = req.app.locals.pool;
  const { ssrn, firstName, lastName, email, password, department, year, dateOfBirth, phoneNumber } = req.body;

  try {
    // Validate input
    if (!ssrn || !firstName || !lastName || !email || !password || !department || !year || !dateOfBirth) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if student already exists
    const [existing] = await pool.execute(
      'SELECT SSRN FROM Student WHERE SSRN = ? OR Email = ?',
      [ssrn, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Student already exists with this SSRN or Email' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert student
    await pool.execute(
      `INSERT INTO Student (SSRN, First_Name, Last_Name, Email, Password_Hash, Department, Year, Date_of_Birth)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ssrn, firstName, lastName, email, passwordHash, department, year, dateOfBirth]
    );

    // Insert phone number if provided
    if (phoneNumber) {
      await pool.execute(
        'INSERT INTO Student_Phone (SSRN, Phone_Number, Phone_Type) VALUES (?, ?, ?)',
        [ssrn, phoneNumber, 'Mobile']
      );
    }

    // Generate token
    const token = jwt.sign(
      { ssrn, email, role: 'student' },
      process.env.JWT_SECRET || 'your_secret_key_here_change_in_production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { ssrn, email, firstName, lastName }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const pool = req.app.locals.pool;
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get student
    const [students] = await pool.execute(
      'SELECT SSRN, First_Name, Last_Name, Email, Password_Hash, Status FROM Student WHERE Email = ?',
      [email]
    );

    if (students.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const student = students[0];

    // Check if account is active
    if (student.Status !== 'Active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, student.Password_Hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { ssrn: student.SSRN, email: student.Email, role: 'student' },
      process.env.JWT_SECRET || 'your_secret_key_here_change_in_production',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        ssrn: student.SSRN,
        email: student.Email,
        firstName: student.First_Name,
        lastName: student.Last_Name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// Admin login (for staff)
router.post('/admin/login', async (req, res) => {
  const pool = req.app.locals.pool;
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get staff member (case-insensitive email check)
    const [staff] = await pool.execute(
      'SELECT Staff_ID, Staff_Name, Email, Role FROM Staff WHERE LOWER(Email) = LOWER(?)',
      [email]
    );

    if (staff.length === 0) {
      // Helpful debug: List available staff emails (only in development)
      if (process.env.NODE_ENV !== 'production') {
        const [allStaff] = await pool.execute('SELECT Email FROM Staff LIMIT 10');
        console.log('Available staff emails:', allStaff.map(s => s.Email));
      }
      return res.status(401).json({ error: 'Invalid email or password. Staff email not found in database.' });
    }

    const staffMember = staff[0];

    // For now, we'll use a simple check - in production, add Password_Hash to Staff table
    // For demo purposes, we'll check if email exists and create a token
    // TODO: Add password hashing to Staff table

    // Generate token
    const token = jwt.sign(
      { staffId: staffMember.Staff_ID, email: staffMember.Email, role: 'admin', staffRole: staffMember.Role },
      process.env.JWT_SECRET || 'your_secret_key_here_change_in_production',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        staffId: staffMember.Staff_ID,
        email: staffMember.Email,
        name: staffMember.Staff_Name,
        role: staffMember.Role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// Verify token
router.get('/verify', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    if (req.user.role === 'admin') {
      // Admin verification
      const [staff] = await pool.execute(
        'SELECT Staff_ID, Staff_Name, Email, Role FROM Staff WHERE Staff_ID = ?',
        [req.user.staffId]
      );

      if (staff.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      const staffMember = staff[0];
      return res.json({
        valid: true,
        user: {
          staffId: staffMember.Staff_ID,
          email: staffMember.Email,
          name: staffMember.Staff_Name,
          role: staffMember.Role
        },
        isAdmin: true
      });
    } else {
      // Student verification
      const [students] = await pool.execute(
        'SELECT SSRN, First_Name, Last_Name, Email, Status FROM Student WHERE SSRN = ?',
        [req.user.ssrn]
      );

      if (students.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const student = students[0];
      return res.json({
        valid: true,
        user: {
          ssrn: student.SSRN,
          email: student.Email,
          firstName: student.First_Name,
          lastName: student.Last_Name,
          status: student.Status
        },
        isAdmin: false
      });
    }
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verification failed', message: error.message });
  }
});

module.exports = router;

