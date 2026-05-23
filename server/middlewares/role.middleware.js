module.exports = function roleMiddleware(requiredRole) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.role !== requiredRole) return res.status(403).json({ success: false, message: 'Forbidden' });
    return next();
  };
};
