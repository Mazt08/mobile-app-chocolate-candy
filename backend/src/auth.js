const jwt = require("jsonwebtoken");
const config = require("./config");
const db = require("./dbDriver");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
    username: user.username,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function authRequired(req, res, next) {
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function roleRequired(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

async function loadUser(req, _res, next) {
  // Optional: hydrate current user from DB if needed later
  try {
    if (req.user?.id && typeof db.findUserById === "function") {
      req.currentUser = await Promise.resolve(db.findUserById(req.user.id));
    }
  } catch {}
  next();
}

module.exports = { signToken, authRequired, roleRequired, loadUser };
