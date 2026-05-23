const crypto = require("crypto");

const secret = process.env.JWT_SECRET || "dev-only-secret";
const defaultExpirySeconds = Number(process.env.JWT_EXPIRES_IN_SECONDS || 60 * 60 * 24 * 7);

function encode(data) {
  return Buffer.from(JSON.stringify(data)).toString("base64url");
}

function sign(payload) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function signToken(payload = {}) {
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + defaultExpirySeconds,
  };
  const encoded = encode(body);
  return `${encoded}.${sign(encoded)}`;
}

function verifyToken(token) {
  try {
    const [encoded, signature] = String(token || "").split(".");
    if (!encoded || !signature) return null;
    if (sign(encoded) !== signature) return null;

    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

module.exports = { signToken, verifyToken };
