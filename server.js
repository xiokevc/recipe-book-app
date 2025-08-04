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

// =================== Routes ===================
const authController = require('./controllers/auth');
const usersController = require('./controllers/users');
const restaurantRoutes = require('./routes/restaurants'); // Import restaurant routes

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
// Parse URL-encoded bodies (for form submissions) and JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Enable method override to support PUT and DELETE in forms
app.use(methodOverride('_method'));

// Serve static assets (CSS, images, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Session configuration for user login sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
}));

// Make logged-in user info available in all views
app.use(passUserToView);

// =================== View Engine ===================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =================== Routes ===================

// Home route
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// Authentication routes
app.use('/auth', authController);

// User-related routes
app.use('/users', usersController);

// Restaurant routes mounted under /users, routes file handles :userId
app.use('/users', restaurantRoutes);

// 404 catch-all
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// =================== Start Server ===================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});



