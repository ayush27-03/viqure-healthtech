/**
 * Strips sensitive fields (passwordHash) from a Mongoose user document
 * and returns a plain object safe for API responses.
 */
const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.passwordHash;
  return user;
};

module.exports = { sanitizeUser };
