const express = require('express');
const router = express.Router();
const User = require('../models/user');

// INDEX – List all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.render('users/index', { users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Server error');
  }
});

// SHOW – Show a single user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('users/show', { user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;

