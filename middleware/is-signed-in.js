module.exports = (req, res, next) => {
  if (req.session.user) {
    // User is signed in — continue as normal
    return next();
  }

  // Allow access to public auth routes
  const publicPaths = ['/auth/sign-in', '/auth/sign-up'];

  if (publicPaths.includes(req.path)) {
    return next(); // Allow access to login and register pages
  }

  // Redirect to sign-in if trying to access a protected route
  return res.redirect('/auth/sign-in');
};
