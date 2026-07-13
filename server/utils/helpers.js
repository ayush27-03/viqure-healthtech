/**
 * Strips sensitive fields (passwordHash) from a Mongoose user document
 * and returns a plain object safe for API responses.
 * $ This sanitze user is a helper function meaning we export it and import to any of the controller
 * $ Now what follows is important during each API call this function is called in order to sanitize a 
 * $ a specific user.
 */
const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.passwordHash;
  return user;
};

const escapeRegex = (str = "") => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = { sanitizeUser, escapeRegex };

