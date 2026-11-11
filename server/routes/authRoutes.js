
const express = require('express');
const router = express.Router();

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. ADMIN REGISTRATION DISABLED
// Public users cannot register as admins
// ==========================================

router.post('/register', (req, res) => {
  return res.status(403).json({
    message: 'Public admin registration is disabled.'
  });
});


// ==========================================
// 2. ADMIN LOGIN
// ==========================================

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Email and password are required.'
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: 'Server authentication configuration error.'
      });
    }

    // Find registered user
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    // Successful login
    res.status(200).json({
      message: 'Login successful',

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);

    res.status(500).json({
      message: 'Unable to process login.'
    });
  }
});

module.exports = router;
