const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

// ========== SIGN-UP (Register) ==========

// GET /auth/sign-up
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up', { user: req.session.user || null });
});


// POST /auth/sign-up
router.post('/sign-up', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    req.session.user = {
      _id: user._id,
      username: user.username,
    };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/auth/sign-up');
  }
});
;

// ========== SIGN-IN (Login) ==========

// GET /auth/sign-in
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in', { user: req.session.user || null });
});


// POST /auth/sign-in
router.post('/sign-in', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  const match = user && await bcrypt.compare(req.body.password, user.password);

  if (match) {
    req.session.user = {
      _id: user._id,
      username: user.username,
    };
    res.redirect(`/users/${user._id}/restaurant`);
  } else {
    res.redirect('/auth/sign-in');
  }
});

// ========== SIGN-OUT ==========

router.get('/sign-out', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
