const express = require('express');
const router = express.Router({ mergeParams: true }); 
const isSignedIn = require('../middleware/is-signed-in');
const restaurantController = require('../controllers/restaurants'); 

// Route definitions
router.get('/', isSignedIn, restaurantController.index);
router.get('/new', isSignedIn, restaurantController.newForm);
router.post('/', isSignedIn, restaurantController.create);
router.get('/:restaurantId', isSignedIn, restaurantController.show);
router.get('/:restaurantId/edit', isSignedIn, restaurantController.editForm);
router.put('/:restaurantId', isSignedIn, restaurantController.update);
router.delete('/:restaurantId', isSignedIn, restaurantController.remove);
router.post('/:restaurantId/reviews', isSignedIn, restaurantController.addReview); 

module.exports = router;

