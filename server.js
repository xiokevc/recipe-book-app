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
const restaurantRoutes = require('./routes/restaurants');

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

// Heroku uses a proxy (e.g., for SSL), so trust it
app.set('trust proxy', 1); 

// Parse URL-encoded bodies and JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override for PUT/DELETE in forms
app.use(methodOverride('_method'));

// Serve static assets (CSS, images, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Configure session
app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));

// Custom middleware: Pass session user to all views
app.use(passUserToView);

// =================== View Engine ===================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =================== Routes ===================

// Home Page
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// Auth Routes
app.use('/auth', authController);

// User Routes
app.use('/users', usersController);

// Restaurant Routes under user context
app.use('/users/:userId/restaurant', restaurantRoutes);

// Catch-all 404
app.use((req, res) => {
  res.status(404).render('404', { user: req.session.user });
});

// =================== Start Server ===================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
