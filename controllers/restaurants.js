const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/user');
const Restaurant = require('../models/restaurant');

// Middleware: Verify user matches the userId in URL
function verifyUserAccess(req, res, next) {
  if (req.session.user && req.session.user._id.toString() === req.params.userId) {
    return next();
  }
  return res.status(403).send('Unauthorized');
}

// ========== INDEX (list all restaurants for user) ==========
router.get('/', verifyUserAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('User not found');

    // Find restaurants owned by user
    const restaurants = await Restaurant.find({ user: req.params.userId });

    res.render('restaurants/index', {
      userId: req.params.userId,
      restaurants,
      user: req.session.user,
    });
  } catch (err) {
    console.error('Error loading restaurants:', err);
    res.status(500).send('Server error');
  }
});

// ========== NEW FORM ==========
router.get('/new', verifyUserAccess, (req, res) => {
  res.render('restaurants/new', {
    userId: req.params.userId,
    user: req.session.user,
  });
});

// ========== CREATE ==========
router.post('/', verifyUserAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('User not found');

    const { name, cuisine, location, rating, review, imageUrl } = req.body;

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).send('Invalid rating. Must be a number between 1 and 5.');
    }

    // Create new restaurant document
    const restaurant = new Restaurant({
      name: name?.trim(),
      cuisine: cuisine?.trim(),
      location: location?.trim(),
      imageUrl: imageUrl?.trim() || '',
      ratings: [{ user: user._id, stars: ratingNum, comment: review?.trim() || '' }],
      user: user._id
    });

    // Calculate average rating (uses instance method)
    restaurant.calculateAverageRating();

    await restaurant.save();
    res.redirect(`/users/${user._id}/restaurant`);
  } catch (err) {
    console.error('Error creating restaurant:', err);
    res.status(500).send('Server error');
  }
});

// ========== SHOW ==========
router.get('/:restaurantId', verifyUserAccess, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId, user: req.params.userId });
    if (!restaurant) return res.status(404).send('Restaurant not found');

    res.render('restaurants/show', {
      restaurant,
      userId: req.params.userId,
      user: req.session.user,
    });
  } catch (err) {
    console.error('Error loading restaurant:', err);
    res.status(500).send('Server error');
  }
});

// ========== EDIT FORM ==========
router.get('/:restaurantId/edit', verifyUserAccess, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId, user: req.params.userId });
    if (!restaurant) return res.status(404).send('Restaurant not found');

    res.render('restaurants/edit', {
      restaurant,
      userId: req.params.userId,
      user: req.session.user,
    });
  } catch (err) {
    console.error('Error loading edit form:', err);
    res.status(500).send('Server error');
  }
});

// ========== UPDATE ==========
router.put('/:restaurantId', verifyUserAccess, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId, user: req.params.userId });
    if (!restaurant) return res.status(404).send('Restaurant not found');

    const { name, cuisine, location, rating, review, imageUrl } = req.body;

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).send('Invalid rating. Must be a number between 1 and 5.');
    }

    // Replace rating array with new rating (or update existing logic as needed)
    restaurant.name = name?.trim();
    restaurant.cuisine = cuisine?.trim();
    restaurant.location = location?.trim();
    restaurant.imageUrl = imageUrl?.trim() || '';
    
    // Assuming 1 rating per user per restaurant. If you want multiple ratings per user, adjust logic.
    restaurant.ratings = [{ user: req.session.user._id, stars: ratingNum, comment: review?.trim() || '' }];

    restaurant.calculateAverageRating();

    await restaurant.save();
    res.redirect(`/users/${req.params.userId}/restaurant`);
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).send('Server error');
  }
});

// ========== DELETE ==========
router.delete('/:restaurantId', verifyUserAccess, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOneAndDelete({ _id: req.params.restaurantId, user: req.params.userId });
    if (!restaurant) return res.status(404).send('Restaurant not found');

    res.redirect(`/users/${req.params.userId}/restaurant`);
  } catch (err) {
    console.error('Error deleting restaurant:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;













