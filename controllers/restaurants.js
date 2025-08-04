const User = require('../models/user');
const Restaurant = require('../models/restaurant');

// Middleware for access control
function verifyUserAccess(req, res, next) {
  if (req.session.user && req.session.user._id.toString() === req.params.userId) {
    return next();
  }
  return res.status(403).send('Unauthorized');
}

// INDEX – List all restaurants for the user
async function index(req, res) {
  try {
    const restaurants = await Restaurant.find({ user: req.params.userId });
    res.render('restaurants/index', {
      user: req.session.user,
      userId: req.params.userId,
      restaurants,
    });
  } catch (err) {
    console.error('Error loading restaurants:', err);
    res.status(500).send('Server error');
  }
}

// NEW – Show form to add a new restaurant
function newForm(req, res) {
  res.render('restaurants/new', {
    user: req.session.user,
    userId: req.params.userId,
  });
}

// CREATE – Create a new restaurant
async function create(req, res) {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('User not found');

    const { name, cuisine, location, rating, review, imageUrl } = req.body;
    const ratingNum = Number(rating);

    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).send('Rating must be a number between 1 and 5');
    }

    const restaurant = new Restaurant({
      name: name?.trim(),
      cuisine: cuisine?.trim(),
      location: location?.trim(),
      imageUrl: imageUrl?.trim() || '',
      ratings: [{ user: user._id, stars: ratingNum, comment: review?.trim() || '' }],
      user: user._id,
    });

    restaurant.calculateAverageRating();
    await restaurant.save();

    res.redirect(`/users/${user._id}/restaurant`);
  } catch (err) {
    console.error('Error creating restaurant:', err);
    res.status(500).send('Server error');
  }
}

// SHOW – Show a single restaurant
async function show(req, res) {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      user: req.params.userId,
    });

    if (!restaurant) return res.status(404).send('Restaurant not found');

    res.render('restaurants/show', {
      restaurant,
      user: req.session.user,
      userId: req.params.userId,
    });
  } catch (err) {
    console.error('Error loading restaurant:', err);
    res.status(500).send('Server error');
  }
}

// EDIT – Show edit form
async function editForm(req, res) {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      user: req.params.userId,
    });

    if (!restaurant) return res.status(404).send('Restaurant not found');

    res.render('restaurants/edit', {
      restaurant,
      user: req.session.user,
      userId: req.params.userId,
    });
  } catch (err) {
    console.error('Error loading edit form:', err);
    res.status(500).send('Server error');
  }
}

// UPDATE – Update a restaurant
async function update(req, res) {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      user: req.params.userId,
    });

    if (!restaurant) return res.status(404).send('Restaurant not found');

    const { name, cuisine, location, rating, review, imageUrl } = req.body;
    const ratingNum = Number(rating);

    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).send('Rating must be between 1 and 5');
    }

    restaurant.name = name?.trim();
    restaurant.cuisine = cuisine?.trim();
    restaurant.location = location?.trim();
    restaurant.imageUrl = imageUrl?.trim() || '';

    const userIdStr = req.session.user._id.toString();
    const existingRatingIndex = restaurant.ratings.findIndex(r => r.user.toString() === userIdStr);

    if (existingRatingIndex >= 0) {
      restaurant.ratings[existingRatingIndex].stars = ratingNum;
      restaurant.ratings[existingRatingIndex].comment = review?.trim() || '';
      restaurant.ratings[existingRatingIndex].updatedAt = new Date();
    } else {
      restaurant.ratings.push({
        user: req.session.user._id,
        stars: ratingNum,
        comment: review?.trim() || '',
      });
    }

    restaurant.calculateAverageRating();
    await restaurant.save();

    res.redirect(`/users/${req.params.userId}/restaurant`);
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).send('Server error');
  }
}

// DELETE – Delete a restaurant
async function remove(req, res) {
  try {
    const restaurant = await Restaurant.findOneAndDelete({
      _id: req.params.restaurantId,
      user: req.params.userId,
    });

    if (!restaurant) return res.status(404).send('Restaurant not found');

    res.redirect(`/users/${req.params.userId}/restaurant`);
  } catch (err) {
    console.error('Error deleting restaurant:', err);
    res.status(500).send('Server error');
  }
}

module.exports = {
  verifyUserAccess,
  index,
  newForm,
  create,
  show,
  editForm,
  update,
  remove,
};















