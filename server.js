// =================== Environment Setup ===================

const dotenv = require('dotenv');
require('dotenv').config();

// =================== Dependencies ===================

const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const isSignedIn = require('./middleware/is-signed-in.js');
const passUserToView = require('./middleware/pass-user-to-view.js');

// =================== Controllers ===================

const authController = require('./controllers/auth.js');
const restaurantController = require('./controllers/restaurant.js');
const usersController = require('./controllers/users.js');

// =================== App Config ===================

const app = express();
const port = process.env.PORT || 3000;

// =================== Database Connection ===================

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);
});

// =================== Middleware ===================

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// =================== Custom Middleware ===================

app.use(passUserToView);
app.use('/users', usersController);

// =================== Routes ===================

// Home route
app.get('/', (req, res) => {
  res.render('index.ejs', {
    user: req.session.user,
  });
});


// Auth routes (sign in / sign up / sign out)
app.use('/auth', authController);

// Pantry routes — only for signed-in users
app.use(isSignedIn); // protect everything below this
app.use('/users/:userId/restaurant', restaurantControllerController);

// =================== Start Server ===================

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});