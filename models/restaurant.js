const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stars: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
}, { timestamps: true });

const restaurantSchema = new Schema({
  name: { type: String, required: true },
  cuisine: String,
  location: String,
  ratings: [ratingSchema], // embedded subdocuments
  averageRating: { type: Number, default: 0 },
}, { timestamps: true });

// Optional: method to update average rating
restaurantSchema.methods.calculateAverageRating = function() {
  if(this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.stars, 0);
    this.averageRating = sum / this.ratings.length;
  }
  return this.averageRating;
}

module.exports = mongoose.model('Restaurant', restaurantSchema);
