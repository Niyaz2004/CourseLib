exports.protect = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    console.log('protect middleware - req.user set:', req.user);
    next();
  } else {
    // Redirect to login page for non-API requests
    if (req.originalUrl.startsWith('/api/')) {
      res.status(401).json({ success: false, message: 'Not authorized' });
    } else {
      res.redirect('/login');
    }
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'User role not authorized' });
    }
    next();
  };
};
