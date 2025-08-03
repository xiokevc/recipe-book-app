// =================== Load Environment Variables ===================
require('dotenv').config();

// =================== Dependencies ===================
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const path = require('path');

// =================== Middleware ===================
const isSignedIn = require('./middleware/is-signed-in');
const passUserToView = require('./middleware/pass-user-to-view');

// =================== Controllers ===================
const authController = require('./controllers/auth');
const restaurantController = require('./controllers/restaurants');
const usersController = require('./controllers/users');

// =================== App Configuration ===================
const app = express();
const PORT = process.env.PORT || 3000;

// =================== Database Connection ===================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log(`✅ MongoDB connected: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error:\n${err}`);
});

// =================== Express Middleware ===================

// Parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Enable method override for PUT & DELETE
app.use(methodOverride('_method'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public'))); // /styles.css, etc.
app.use('/assets', express.static(path.join(__dirname, 'assets'))); // /assets/forkit.png

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
}));

// Share user data with all views
app.use(passUserToView);

// =================== View Engine ===================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =================== Routes ===================

// Home page
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// Auth & user routes
app.use('/auth', authController);
app.use('/users', usersController);

// Restaurant routes (protected, nested under user)
app.use('/users/:userId/restaurant', isSignedIn, restaurantController);

// Catch-all 404
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// =================== Start Server ===================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});



