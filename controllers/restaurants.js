const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/user');

// Middleware: Verify user session matches URL param
function verifyUserAccess(req, res, next) {
  if (req.session.user && req.session.user._id.toString() === req.params.userId) {
    return next();
  }
  return res.status(403).send('Unauthorized');
}

// INDEX: List all restaurants for user
router.get('/', verifyUserAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('User not found');

    res.render('restaurants/index', {
      userId: req.params.userId,
      restaurants: user.restaurants,
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// NEW: Show form for new restaurant
router.get('/new', verifyUserAccess, (req, res) => {
  res.render('restaurants/new', {
    userId: req.params.userId,
    user: req.session.user,
  });
});

// CREATE: Add new restaurant
router.post('/', verifyUserAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('User not found');

    if (!Array.isArray(user.restaurants)) user.restaurants = [];

    const { name, cuisine, rating, review } = req.body;
    user.restaurants.push({
      name,
      cuisine,
      rating: Number(rating),
      review,
    });

    await user.save();
    res.redirect(`/users/${user._id}/restaurant`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// SHOW: Show one restaurant details
router.get('/:restaurantId', verifyUserAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('User not found');

    const restaurant = user.restaurants.id(req.params.restaurantId);
    if (!restaurant) return res.status(404).send('Restaurant not found');

    res.render('restaurants/show', {
      restaurant,
      userId: req.params.userId,
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// EDIT: Show form to edit restaurant
router.get('/:restaurantId/edit', verifyUserAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('User not found');

    const restaurant = user.restaurants.id(req.params.restaurantId);
    if (!restaurant) return res.status(404).send('Restaurant not found');

    res.render('restaurants/edit', {
      restaurant,
      userId: req.params.userId,
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// UPDATE: Update restaurant info
router.put('/:restaurantId', verifyUserAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('User not found');

    const restaurant = user.restaurants.id(req.params.restaurantId);
    if (!restaurant) return res.status(404).send('Restaurant not found');

    const { name, cuisine, rating, review } = req.body;
    restaurant.set({
      name,
      cuisine,
      rating: Number(rating),
      review,
    });

    await user.save();
    res.redirect(`/users/${user._id}/restaurant`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// DELETE: Remove restaurant
router.delete('/:restaurantId', verifyUserAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('User not found');

    // Check if restaurant exists
    const restaurant = user.restaurants.find(r => r._id.toString() === req.params.restaurantId);
    if (!restaurant) return res.status(404).send('Restaurant not found');

    // Remove restaurant by filtering
    user.restaurants = user.restaurants.filter(r => r._id.toString() !== req.params.restaurantId);

    await user.save();

    res.redirect(`/users/${user._id}/restaurant`);
  } catch (err) {
    console.error('Error deleting restaurant:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;







