const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: String,
  cuisine: String,
  location: String,
  // add more fields as needed
});

module.exports = restaurantSchema;
