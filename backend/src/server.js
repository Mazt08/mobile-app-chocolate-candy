const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const db = require("./dbDriver");
const { signToken, authRequired, roleRequired, loadUser } = require("./auth");
const config = require("./config");

const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json());

// Crash visibility: surface unhandled errors during local dev
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});

// Friendly root message so visiting the backend URL doesn't show a 404
app.get("/api", (_req, res) => {
  res
    .status(200)
    .send(
      "Chocolate Candy API is running. Try GET /api/health. The frontend is deployed as a separate Static Site."
    );
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/categories", async (_req, res) => {
  try {
    const data = await Promise.resolve(db.getCategories());
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { q, category, sort } = req.query;
    // If driver has getProducts with filtering, use it; otherwise emulate
    const raw = await Promise.resolve(db.getProducts({ q, category, sort }));
    if (Array.isArray(raw)) return res.json(raw);
    let items = db.getProducts();
    if (q) {
      const term = String(q).toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(term));
    }
    if (category) {
      items = items.filter((p) => p.category === category);
    }
    if (sort === "priceAsc")
      items = items.slice().sort((a, b) => a.price - b.price);
    if (sort === "priceDesc")
      items = items.slice().sort((a, b) => b.price - a.price);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.get("/api/offers", async (_req, res) => {
  try {
    const data = await Promise.resolve(db.getOffers());
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Orders: require auth and return only current user's orders
app.get("/api/orders", authRequired, loadUser, async (req, res) => {
  try {
    const data = await Promise.resolve(db.getOrders({ userId: req.user.id }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Create order: associates the current user to the order
app.post("/api/orders", authRequired, loadUser, async (req, res) => {
  try {
    const payload = req.body || {};
    const created = await Promise.resolve(
      db.createOrder({ ...payload, userId: req.user.id })
    );
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body || {};
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    // Normalize email/username to reduce duplicate collisions
    const emailId = String(email).trim();
    const usernameId = String(username).trim();
    const existing = await Promise.resolve(
      db.findUserByEmailOrUsername(emailId)
    );
    const existing2 = await Promise.resolve(
      db.findUserByEmailOrUsername(usernameId)
    );
    if (existing || existing2) {
      return res.status(409).json({ error: "User already exists" });
    }
    const created = await Promise.resolve(
      db.createUser({
        name,
        username: usernameId,
        email: emailId,
        password,
        role,
      })
    );
    const token = signToken(created);
    return res.status(201).json({ user: created, token });
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    // Handle common MySQL errors gracefully
    if (msg.includes("ER_DUP_ENTRY") || /duplicate/i.test(msg)) {
      return res.status(409).json({ error: "User already exists" });
    }
    if (/ECONNREFUSED|connect ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(msg)) {
      return res.status(503).json({ error: "Database unavailable" });
    }
    return res.status(500).json({ error: msg });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { identity, password } = req.body || {};
    if (!identity || !password)
      return res.status(400).json({ error: "Missing credentials" });
    const user = await Promise.resolve(db.findUserByEmailOrUsername(identity));
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    // JSON driver stores plaintext; MySQL driver stores bcrypt hash.
    const ok = user.password
      ? require("bcryptjs").compareSync(password, user.password) ||
        user.password === password
      : false;
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const { password: _pw, ...safe } = user;
    const token = signToken(safe);
    res.json({ user: safe, token });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Example secured admin endpoint
app.get(
  "/api/admin/users",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (_req, res) => {
    try {
      const users = await Promise.resolve(db.listUsers());
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Choco backend running on http://localhost:${PORT}`);
});

// -------------------- Optional SPA hosting (single-service mode) --------------------
// If the frontend has been built into chocolate-candy/www, serve it statically from here.
// This lets a single Web Service host both API and the Angular SPA on Render free tier.
try {
  const webRoot = path.join(__dirname, "..", "..", "chocolate-candy", "www");
  if (fs.existsSync(webRoot)) {
    app.use(express.static(webRoot));
    // SPA fallback: send index.html for non-API routes
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(webRoot, "index.html"));
    });
    console.log(`[SPA] Serving frontend from ${webRoot}`);
  } else {
    console.log(
      "[SPA] Frontend build not found (chocolate-candy/www). Skipping static hosting."
    );
  }
} catch (e) {
  console.warn("[SPA] Static hosting setup failed:", e?.message || e);
}
