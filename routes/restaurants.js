const express = require('express');
const router = express.Router({ mergeParams: true });

const restaurantsController = require('../controllers/restaurants'); 
const isSignedIn = require('../middleware/is-signed-in'); 

// Routes
router.get('/', isSignedIn, restaurantsController.verifyUserAccess, restaurantsController.index);
router.get('/new', isSignedIn, restaurantsController.verifyUserAccess, restaurantsController.newForm);
router.post('/', isSignedIn, restaurantsController.verifyUserAccess, restaurantsController.create);
router.get('/:restaurantId', isSignedIn, restaurantsController.verifyUserAccess, restaurantsController.show);
router.get('/:restaurantId/edit', isSignedIn, restaurantsController.verifyUserAccess, restaurantsController.editForm);
router.put('/:restaurantId', isSignedIn, restaurantsController.verifyUserAccess, restaurantsController.update);
router.delete('/:restaurantId', isSignedIn, restaurantsController.verifyUserAccess, restaurantsController.remove);

module.exports = router;


