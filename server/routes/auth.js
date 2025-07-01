import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/init.js';

const router = express.Router();

// Admin login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.adminId = admin.id;
    req.session.username = admin.username;

    res.json({ success: true, username: admin.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check authentication status
router.get('/check', (req, res) => {
  if (req.session.adminId) {
    res.json({ authenticated: true, username: req.session.username });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ success: true });
  });
});

export default router;