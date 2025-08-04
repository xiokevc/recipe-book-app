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

    return res.render('restaurants/index', {
      userId: req.params.userId,
      restaurants,
      user: req.session.user,
    });
  } catch (err) {
    console.error('Error loading restaurants:', err);
    return res.status(500).send('Server error');
  }
});

// ========== NEW FORM ==========
router.get('/new', verifyUserAccess, (req, res) => {
  return res.render('restaurants/new', {
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

    const restaurant = new Restaurant({
      name: name?.trim(),
      cuisine: cuisine?.trim(),
      location: location?.trim(),
      imageUrl: imageUrl?.trim() || '',
      ratings: [{ user: user._id, stars: ratingNum, comment: review?.trim() || '' }],
      user: user._id
    });

    restaurant.calculateAverageRating();

    await restaurant.save();

    return res.redirect(`/users/${user._id}/restaurant`);
  } catch (err) {
    console.error('Error creating restaurant:', err);
    return res.status(500).send('Server error');
  }
});

// ========== SHOW ==========
router.get('/:restaurantId', verifyUserAccess, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId, user: req.params.userId });
    if (!restaurant) return res.status(404).send('Restaurant not found');

    return res.render('restaurants/show', {
      restaurant,
      userId: req.params.userId,
      user: req.session.user,
    });
  } catch (err) {
    console.error('Error loading restaurant:', err);
    return res.status(500).send('Server error');
  }
});

// ========== EDIT FORM ==========
router.get('/:restaurantId/edit', verifyUserAccess, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId, user: req.params.userId });
    if (!restaurant) return res.status(404).send('Restaurant not found');

    return res.render('restaurants/edit', {
      restaurant,
      userId: req.params.userId,
      user: req.session.user,
    });
  } catch (err) {
    console.error('Error loading edit form:', err);
    return res.status(500).send('Server error');
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

    restaurant.name = name?.trim();
    restaurant.cuisine = cuisine?.trim();
    restaurant.location = location?.trim();
    restaurant.imageUrl = imageUrl?.trim() || '';

    // Check if user already rated this restaurant
    const userIdStr = req.session.user._id.toString();
    const existingRatingIndex = restaurant.ratings.findIndex(r => r.user.toString() === userIdStr);

    if (existingRatingIndex >= 0) {
      // Update existing rating
      restaurant.ratings[existingRatingIndex].stars = ratingNum;
      restaurant.ratings[existingRatingIndex].comment = review?.trim() || '';
      restaurant.ratings[existingRatingIndex].updatedAt = new Date();
    } else {
      // Add new rating
      restaurant.ratings.push({
        user: req.session.user._id,
        stars: ratingNum,
        comment: review?.trim() || ''
      });
    }

    restaurant.calculateAverageRating();

    await restaurant.save();

    return res.redirect(`/users/${req.params.userId}/restaurant`);
  } catch (err) {
    console.error('Error updating restaurant:', err);
    return res.status(500).send('Server error');
  }
});

// ========== DELETE ==========
router.delete('/:restaurantId', verifyUserAccess, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOneAndDelete({ _id: req.params.restaurantId, user: req.params.userId });
    if (!restaurant) return res.status(404).send('Restaurant not found');

    return res.redirect(`/users/${req.params.userId}/restaurant`);
  } catch (err) {
    console.error('Error deleting restaurant:', err);
    return res.status(500).send('Server error');
  }
});

module.exports = router;














