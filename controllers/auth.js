const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

// ========== SIGN-UP (Register) ==========

// GET /auth/sign-up
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up', { user: req.session.user || null, errorMessage: null });
});

// POST /auth/sign-up
router.post('/sign-up', async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.render('auth/sign-up', {
        user: null,
        errorMessage: 'Email already registered. Please try signing in or use another email.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      email: emailLower,
      password: hashedPassword,
    });

    // Save user session
    req.session.user = {
      _id: user._id,
      email: user.email,
    };

    // Redirect to restaurant index page after signup
    res.redirect(`/users/${user._id}/restaurant`);
  } catch (err) {
    console.error('Sign-up error:', err);
    res.render('auth/sign-up', {
      user: null,
      errorMessage: 'An error occurred. Please try again.',
    });
  }
});

// ========== SIGN-IN (Login) ==========

// GET /auth/sign-in
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in', { user: req.session.user || null, errorMessage: null });
});

// POST /auth/sign-in
router.post('/sign-in', async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase();

    // Find user by email
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.render('auth/sign-in', {
        user: null,
        errorMessage: 'Wrong username/password combination. Try Again.',
      });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('auth/sign-in', {
        user: null,
        errorMessage: 'Wrong username/password combination. Try Again.',
      });
    }

    // Successful login: save session
    req.session.user = {
      _id: user._id,
      email: user.email,
    };

    // Redirect to restaurant index page
    res.redirect(`/users/${user._id}/restaurant`);
  } catch (err) {
    console.error('Sign-in error:', err);
    res.render('auth/sign-in', {
      user: null,
      errorMessage: 'An error occurred. Please try again.',
    });
  }
});

// ========== SIGN-OUT ==========

// GET /auth/sign-out
router.get('/sign-out', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;



