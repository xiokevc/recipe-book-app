const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // optional: store user ratings or favorites
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
