// =================== Environment Setup ===================
const dotenv = require('dotenv');
dotenv.config();

// =================== Dependencies ===================
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');

// =================== Middleware ===================
const isSignedIn = require('./middleware/is-signed-in.js');
const passUserToView = require('./middleware/pass-user-to-view.js');

// =================== Controllers ===================
const authController = require('./controllers/auth.js');
const restaurantController = require('./controllers/restaurants.js');
const usersController = require('./controllers/users.js');

// =================== App Config ===================
const app = express();
const port = process.env.PORT || 3000;

// =================== Database Connection ===================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error:\n${err}`);
});

// =================== Middleware ===================
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));
app.use(passUserToView);
app.use(express.static('public'));

// =================== View Engine ===================
app.set('view engine', 'ejs');

// =================== Routes ===================

// Home Page
app.get('/', (req, res) => {
  res.render('index.ejs', {
    user: req.session.user,
  });
});

// Public Routes
app.use('/auth', authController);   // Handles sign-in and sign-up
app.use('/users', usersController); // Handles user profiles or settings

// Protected Routes (requires login)
app.use('/users/:userId/restaurant', isSignedIn, restaurantController); // ✅ Fix here

// Catch-all 404
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// =================== Start Server ===================
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});

