const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

// ========== SIGN-UP (Register) ==========

// GET /auth/sign-up
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up', {
    user: req.session.user || null,
    errorMessage: null
  });
});

// POST /auth/sign-up
router.post('/sign-up', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const emailLower = email.toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: emailLower }, { username }]
    });

    if (existingUser) {
      return res.render('auth/sign-up', {
        user: null,
        errorMessage: 'Username or email already taken.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email: emailLower,
      password: hashedPassword,
    });

    req.session.user = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    };

    res.redirect(`/users/${newUser._id}/restaurant`);
  } catch (err) {
    console.error('Sign-up error:', err);
    res.render('auth/sign-up', {
      user: null,
      errorMessage: 'An error occurred during sign-up. Please try again.',
    });
  }
});

// ========== SIGN-IN (Login) ==========

// GET /auth/sign-in
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in', {
    user: req.session.user || null,
    errorMessage: null
  });
});

// POST /auth/sign-in
router.post('/sign-in', async (req, res) => {
  try {
    const { identifier, password } = req.body; // "identifier" can be username or email
    const identifierLower = identifier.toLowerCase();

    const user = await User.findOne({
      $or: [
        { email: identifierLower },
        { username: identifier }
      ]
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('auth/sign-in', {
        user: null,
        errorMessage: 'Invalid username/email or password.',
      });
    }

    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
    };

    res.redirect(`/users/${user._id}/restaurant`);
  } catch (err) {
    console.error('Sign-in error:', err);
    res.render('auth/sign-in', {
      user: null,
      errorMessage: 'An error occurred during sign-in. Please try again.',
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





