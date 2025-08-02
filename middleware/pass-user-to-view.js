const User = require('../models/user');

module.exports = async function(req, res, next) {
  if (req.session && req.session.userId) {
    const user = await User.findById(req.session.userId);
    res.locals.currentUser = user;
  } else {
    res.locals.currentUser = null;
  }
  next();
};
