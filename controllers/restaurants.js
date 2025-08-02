// controllers/restaurants.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/user');

// INDEX
router.get('/', async (req, res) => {
  const userId = req.params.userId;
  // Fetch restaurants for the user
  res.render('restaurants/index', { user: req.session.user });
});

// NEW
router.get('/new', (req, res) => {
  res.render('restaurants/new', { userId: req.params.userId });
});

// CREATE
router.post('/', async (req, res) => {
  const user = await User.findById(req.params.userId);
  user.restaurants.push(req.body);
  await user.save();
  res.redirect(`/users/${user._id}/restaurant`);
});

// SHOW
router.get('/:restaurantId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  const restaurant = user.restaurants.id(req.params.restaurantId);
  res.render('restaurants/show', { restaurant, userId: req.params.userId });
});

// EDIT
router.get('/:restaurantId/edit', async (req, res) => {
  const user = await User.findById(req.params.userId);
  const restaurant = user.restaurants.id(req.params.restaurantId);
  res.render('restaurants/edit', { restaurant, userId: req.params.userId });
});

// UPDATE
router.put('/:restaurantId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  const restaurant = user.restaurants.id(req.params.restaurantId);
  restaurant.set(req.body);
  await user.save();
  res.redirect(`/users/${user._id}/restaurant`);
});

// DELETE
router.delete('/:restaurantId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  user.restaurants.id(req.params.restaurantId).remove();
  await user.save();
  res.redirect(`/users/${user._id}/restaurant`);
});

module.exports = router;



