const User = require('../models/user');

module.exports = async function(req, res, next) {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      res.locals.currentUser = user;
    } catch (err) {
      console.error('Error fetching user in middleware:', err);
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
};
