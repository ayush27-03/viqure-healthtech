const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET is not set — check .env and dotenv load order");

const defaultExpiry = process.env.JWT_EXPIRES_IN;

/**
 * Signs a JWT containing the user's _id and role.
 * @param {Object} user – Mongoose user document (needs _id and role).
 * @returns {string} Signed JWT string.
 */
function signToken(user) {
  return jwt.sign(
    { _id: String(user._id), role: user.role },
    secret,
    { expiresIn: defaultExpiry },
  );
}

/**
 * Verifies a JWT and returns the decoded payload, or null on failure.
 * @param {string} token – Raw JWT string (without "Bearer " prefix).
 * @returns {Object|null} Decoded payload or null.
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

module.exports = { signToken, verifyToken };
