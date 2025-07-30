const express = require('express');
const router = express.Router();
const Restaurant = require('../models/restaurant');

// INDEX - list all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.render('restaurants/index.ejs', { restaurants });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// NEW - form to add a restaurant
router.get('/new', (req, res) => {
  res.render('restaurants/new.ejs');
});

// CREATE - add restaurant
router.post('/', async (req, res) => {
  try {
    const newRestaurant = new Restaurant({
      name: req.body.name,
      location: req.body.location,
      cuisine: req.body.cuisine
    });
    await newRestaurant.save();
    res.redirect('/restaurants');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// EDIT - form to edit restaurant
router.get('/:id/edit', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).send("Restaurant not found");
    res.render('restaurants/edit.ejs', { restaurant });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// UPDATE - modify restaurant
router.put('/:id', async (req, res) => {
  try {
    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        location: req.body.location,
        cuisine: req.body.cuisine
      },
      { new: true }
    );
    res.redirect('/restaurants');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// DELETE - remove restaurant
router.delete('/:id', async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.redirect('/restaurants');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;


