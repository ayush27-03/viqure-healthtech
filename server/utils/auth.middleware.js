const { verifyToken } = require("./jwt.util");

// Simple auth middleware: expects header `Authorization: Bearer <token>` where
// token is the base64-encoded JSON produced by signToken().
module.exports = function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return res.status(401).json({ success: false, message: "Missing Authorization header" });

  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return res.status(401).json({ success: false, message: "Invalid Authorization format" });
  }

  const token = parts[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ success: false, message: "Invalid or expired token" });

  req.user = payload;
  return next();
};
