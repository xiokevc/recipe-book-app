const express = require('express');
const router = express.Router();
const User = require('../models/user');

// INDEX
router.get('/', async (req, res) => {
  const users = await User.find({});
  res.render('users/index', { users });
});

// SHOW
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('users/show', { user });
});

module.exports = router;
