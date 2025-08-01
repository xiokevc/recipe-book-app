const mongoose = require('mongoose');
const restaurantSchema = require('./restaurant');


const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  restaurant: [restaurantSchema],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
