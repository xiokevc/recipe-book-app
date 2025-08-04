const Restaurant = require('../models/restaurant');

module.exports.createReview = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { stars, comment } = req.body;

    // Validate input
    if (!stars || !comment) {
      return res.status(400).send('Stars and comment are required');
    }

    // Validate stars range 
    const starsNum = Number(stars);
    if (isNaN(starsNum) || starsNum < 1 || starsNum > 5) {
      return res.status(400).send('Stars must be a number between 1 and 5');
    }

    // Find restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).send('Restaurant not found');
    }

    // Add new review with user ref
    restaurant.ratings.push({
      user: req.user._id,
      stars: starsNum,
      comment: comment.trim(),
    });

    // Recalculate average rating
    restaurant.calculateAverageRating();

    // Save restaurant document
    await restaurant.save();

    // Redirect back to the restaurant details page
    res.redirect(`/users/${req.user._id}/restaurant/${restaurantId}`);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).send('Server error');
  }
};
