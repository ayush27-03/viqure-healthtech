// Minimal token helpers for local development/stubbing.
// Uses a reversible base64 encoding of a JSON payload.
function signToken(payload = {}) {
  const raw = JSON.stringify(payload);
  return Buffer.from(raw).toString("base64");
}

function verifyToken(token) {
  try {
    const raw = Buffer.from(token, "base64").toString("utf8");
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

module.exports = { signToken, verifyToken };
