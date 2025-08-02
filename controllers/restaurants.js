const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/user');

// Middleware to check if logged-in user matches route userId
function verifyUserAccess(req, res, next) {
  if (req.session.user && req.session.user._id === req.params.userId) {
    return next();
  }
  return res.status(403).send('Unauthorized access.');
}

// INDEX - Show all restaurants for the logged-in user
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
    console.error('Error fetching restaurants:', err);
    res.status(500).send('Server error');
  }
});

// NEW - Show form to create new restaurant
router.get('/new', verifyUserAccess, (req, res) => {
  res.render('restaurants/new', {
    userId: req.params.userId,
    user: req.session.user,
  });
});

// CREATE - Add a new restaurant
router.post('/', verifyUserAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('User not found');

    user.restaurants.push(req.body);
    await user.save();
    res.redirect(`/users/${user._id}/restaurant`);
  } catch (err) {
    console.error('Error creating restaurant:', err);
    res.status(500).send('Server error');
  }
});

// SHOW - Show specific restaurant details
router.get('/:restaurantId', verifyUserAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const restaurant = user?.restaurants.id(req.params.restaurantId);
    if (!restaurant) return res.status(404).send('Restaurant not found');

    res.render('restaurants/show', {
      restaurant,
      userId: req.params.userId,
      user: req.session.user,
    });
  } catch (err) {
    console.error('Error fetching restaurant:', err);
    res.status(500).send('Server error');
  }
});

// EDIT - Show form to edit a restaurant
router.get('/:restaurantId/edit', verifyUserAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const restaurant = user?.restaurants.id(req.params.restaurantId);
    if (!restaurant) return res.status(404).send('Restaurant not found');

    res.render('restaurants/edit', {
      restaurant,
      userId: req.params.userId,
      user: req.session.user,
    });
  } catch (err) {
    console.error('Error fetching restaurant for edit:', err);
    res.status(500).send('Server error');
  }
});

// UPDATE - Update restaurant info
router.put('/:restaurantId', verifyUserAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const restaurant = user?.restaurants.id(req.params.restaurantId);
    if (!restaurant) return res.status(404).send('Restaurant not found');

    restaurant.set(req.body);
    await user.save();
    res.redirect(`/users/${user._id}/restaurant`);
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).send('Server error');
  }
});

// DELETE - Delete a restaurant
router.delete('/:restaurantId', verifyUserAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const restaurant = user?.restaurants.id(req.params.restaurantId);
    if (!restaurant) return res.status(404).send('Restaurant not found');

    restaurant.remove();
    await user.save();
    res.redirect(`/users/${user._id}/restaurant`);
  } catch (err) {
    console.error('Error deleting restaurant:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;




