const express = require('express');
const router = express.Router();
const User = require('../models/user');

// INDEX – show all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.render('users/index.ejs', { users });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// SHOW – individual user page
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render('users/show.ejs', { user });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Show route — show one user's pantry
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render('users/show.ejs', { user });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
