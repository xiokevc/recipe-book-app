const mongoose = require('mongoose');

// Subdocument schema for restaurants
const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  cuisine: {
    type: String,
    required: [true, 'Cuisine type is required'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Minimum rating is 1'],
    max: [5, 'Maximum rating is 5']
  },
  review: {
    type: String,
    required: [true, 'Review is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    default: '',
    trim: true
  },
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Main user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  restaurants: [restaurantSchema]
});

module.exports = mongoose.model('User', userSchema);


