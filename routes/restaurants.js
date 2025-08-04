const express = require('express');
const router = express.Router();
const restaurantsController = require('../controllers/restaurants');
const { isSignedIn } = require('../middleware/is-signed-in');

// Show all restaurants for a user
router.get('/:userId/restaurant', isSignedIn, restaurantsController.index);

// Show new restaurant form
router.get('/:userId/restaurant/new', isSignedIn, restaurantsController.newForm);

// Create new restaurant
router.post('/:userId/restaurant', isSignedIn, restaurantsController.create);

// Show single restaurant
router.get('/:userId/restaurant/:id', isSignedIn, restaurantsController.show);

// Add review to restaurant
router.post('/:userId/restaurant/:id/reviews', isSignedIn, restaurantsController.addReview);

// Edit & Delete routes as needed...

module.exports = router;