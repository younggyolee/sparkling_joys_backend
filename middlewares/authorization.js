function authorization(req, res, next) {
  if (req.user) {
    next();
  } else {
    // req.session.returnTo = req.originalUrl;
    // res.redirect('/login');
    res.status(403).json({
      result: 'error',
      message: 'Login required.'
    });
  }
}

exports.authorization = authorization;
