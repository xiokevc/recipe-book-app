const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Rating Schema
const ratingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stars: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },
}, { timestamps: true });

// Restaurant Schema
const restaurantSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // <-- Add user ref here
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  cuisine: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return true; // allow empty or undefined
        try {
          const url = new URL(v);
          return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname);
        } catch {
          return false;
        }
      },
      message: props => `${props.value} is not a valid image URL (must be a direct image link)`
    }
  },
  ratings: [ratingSchema], // Embedded subdocuments
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
}, { timestamps: true });

// Instance Method
restaurantSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.stars, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10; // round to 1 decimal place
  }
  return this.averageRating;
};

module.exports = mongoose.model('Restaurant', restaurantSchema);


