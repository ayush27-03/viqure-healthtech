const { verifyToken } = require('../utils/jwt.util');
const { User } = require('../models/index');
const ApiError = require('../utils/ApiError');

/**
 * Verifies the JWT from the Authorization header, fetches the full user
 * document from the database, and attaches it to req.user.
 */
const protect = async (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return next(new ApiError(401, 'Missing Authorization header'));

  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return next(new ApiError(401, 'Invalid Authorization format'));
  }

  const payload = verifyToken(parts[1]);
  if (!payload) return next(new ApiError(401, 'Invalid or expired token'));

  const user = await User.findById(payload._id);
  if (!user) return next(new ApiError(401, 'User no longer exists'));
  if (!user.isActive) return next(new ApiError(403, 'This account has been deactivated'));

  req.user = user;
  return next();
};

/**
 * Restricts access to one or more roles.
 * Usage: restrictTo('ADMIN') or restrictTo('ADMIN', 'DOCTOR')
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Not authenticated'));
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden'));
  }
  return next();
};

module.exports = { protect, restrictTo };
