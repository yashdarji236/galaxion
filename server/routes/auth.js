const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { mockUser } = require('../models/mockData');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Fallback if MongoDB is offline
  if (mongoose.connection.readyState !== 1) {
    if (email.toLowerCase().trim() === 'admin@galaxion.dev' && password === 'galaxion2026') {
      const token = jwt.sign(
        { id: mockUser.id, email: mockUser.email },
        process.env.JWT_SECRET || 'galaxion_secret_key_2026_isro_bah_ps08',
        { expiresIn: '24h' }
      );
      return res.json({
        token,
        user: mockUser
      });
    }
    return res.status(400).json({ message: 'Invalid offline operator credentials' });
  }

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'galaxion_secret_key_2026_isro_bah_ps08',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login authentication' });
  }
});

module.exports = router;
