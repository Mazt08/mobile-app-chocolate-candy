const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const db = require("./dbDriver");
const { signToken, authRequired, roleRequired, loadUser } = require("./auth");
const config = require("./config");

const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json());

// File uploads setup (images only) and static serving
const uploadDir = process.env.UPLOAD_DIR
  ? String(process.env.UPLOAD_DIR)
  : path.join(__dirname, "..", "uploads");
try {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
  console.warn("[upload] Failed to ensure uploads dir:", e?.message || e);
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && ext.length <= 10 ? ext : "";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ok = /^(image\/jpeg|image\/png|image\/gif|image\/webp)$/i.test(
      file.mimetype || ""
    );
    cb(ok ? null : new Error("Only image uploads are allowed"), ok);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});
app.use("/uploads", express.static(uploadDir));

// Require MySQL and validate connectivity at startup (fail fast if unavailable)
try {
  const mysqlDriver = require("./mysql");
  (async () => {
    try {
      const pool = mysqlDriver.getPool();
      await pool.query("SELECT 1");
      console.log("[DB] MySQL connectivity OK");
    } catch (e) {
      console.error("[DB] MySQL connectivity failed:", e?.message || e);
      process.exit(1);
    }
  })();
} catch (e) {
  console.error("[DB] Failed to initialize MySQL module:", e?.message || e);
  process.exit(1);
}

// Crash visibility: surface unhandled errors during local dev
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});

// Friendly root message so visiting the backend URL doesn't show a 404
app.get("/", (_req, res) => {
  res
    .status(200)
    .send(
      "Chocolate Candy API is running. Try GET /api/health. The frontend is deployed as a separate Static Site."
    );
});

app.get("/api/health", async (_req, res) => {
  const info = { ok: true, driver: "mysql" };
  try {
    // light ping: try fetching categories (works for both drivers)
    await Promise.resolve(db.getCategories());
    info["db"] = "up";
  } catch (e) {
    info["db"] = "down";
    info["error"] = String(e?.message || e);
  }
  res.json({
    ok: true,
    driver: "mysql",
    time: new Date().toISOString(),
  });
});

// Upload endpoint (returns public URL)
app.post(
  "/api/upload",
  authRequired,
  loadUser,
  (req, res, next) =>
    upload.single("file")(req, res, (err) => {
      if (err)
        return res.status(400).json({ error: String(err?.message || err) });
      next();
    }),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const url = `${config.BASE_URL || ""}/uploads/${req.file.filename}`
        .replace(/\/$/, "")
        .replace(/:\/$/, ":/");
      return res.status(201).json({
        url: url.startsWith("http") ? url : `/uploads/${req.file.filename}`,
      });
    } catch (e) {
      res.status(500).json({ error: String(e?.message || e) });
    }
  }
);

// Diagnostics: DB stats (admin only)
app.get(
  "/api/admin/db-info",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (_req, res) => {
    try {
      const mysqlDriver = require("./mysql");
      const pool = mysqlDriver.getPool();
      const [[catRow]] = await pool.query(
        "SELECT COUNT(*) AS c FROM categories"
      );
      const [[prodRow]] = await pool.query(
        "SELECT COUNT(*) AS c FROM products"
      );
      const [[userRow]] = await pool.query("SELECT COUNT(*) AS c FROM users");
      const [[orderRow]] = await pool.query("SELECT COUNT(*) AS c FROM orders");
      const [[vRow]] = await pool.query("SELECT VERSION() AS version");
      return res.json({
        driver: "mysql",
        mysql: {
          version: vRow.version,
          categories: catRow.c,
          products: prodRow.c,
          users: userRow.c,
          orders: orderRow.c,
        },
      });
    } catch (e) {
      res.status(500).json({ error: String(e?.message || e) });
    }
  }
);

app.get("/api/categories", async (_req, res) => {
  try {
    const data = await Promise.resolve(db.getCategories());
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ---------------- Messaging (User) ----------------
// Create a new conversation from Contact Us
app.post("/api/contact", authRequired, loadUser, async (req, res) => {
  try {
    const { subject, message } = req.body || {};
    if (!subject || !message)
      return res.status(400).json({ error: "Missing subject or message" });
    if (!db.createConversation)
      return res.status(501).json({ error: "Driver missing conversations" });
    const conv = await Promise.resolve(
      db.createConversation(req.user.id, subject, message)
    );
    if (global.__io) global.__io.to("admin").emit("conversation:new", conv);
    res.status(201).json(conv);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// List user's conversations
app.get("/api/messages", authRequired, loadUser, async (req, res) => {
  try {
    const rows = await Promise.resolve(db.listUserConversations(req.user.id));
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Get single conversation + messages
app.get("/api/messages/:id", authRequired, loadUser, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const conv = await Promise.resolve(
      db.getConversationForUser(id, req.user.id)
    );
    if (!conv) return res.status(404).json({ error: "Not found" });
    const msgs = await Promise.resolve(db.listMessages(id));
    res.json({ conversation: conv, messages: msgs });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Reply in a conversation (user)
app.post(
  "/api/messages/:id/reply",
  authRequired,
  loadUser,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const conv = await Promise.resolve(
        db.getConversationForUser(id, req.user.id)
      );
      if (!conv) return res.status(404).json({ error: "Not found" });
      const { message, imageUrl } = req.body || {};
      if (!message && !imageUrl)
        return res.status(400).json({ error: "Missing message or image" });
      await Promise.resolve(
        db.addMessage(id, "user", req.user.id, message || "", imageUrl || null)
      );
      if (global.__io) {
        global.__io
          .to("admin")
          .emit("message:new", { conversationId: id, from: "user" });
        global.__io
          .to(`user:${req.user.id}`)
          .emit("message:ack", { conversationId: id });
      }
      res.status(201).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

// Delete conversation (user)
app.delete("/api/messages/:id", authRequired, loadUser, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ok = await Promise.resolve(
      db.deleteConversationForUser(id, req.user.id)
    );
    if (!ok) return res.status(404).json({ error: "Not found" });
    if (global.__io)
      global.__io.to("admin").emit("conversation:deletedByUser", { id });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Mark read (user)
app.post("/api/messages/:id/read", authRequired, loadUser, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!db.markReadForUser)
      return res.status(501).json({ error: "Driver missing markReadForUser" });
    const conv = await Promise.resolve(
      db.getConversationForUser(id, req.user.id)
    );
    if (!conv) return res.status(404).json({ error: "Not found" });
    await Promise.resolve(db.markReadForUser(id, req.user.id));
    if (global.__io)
      global.__io
        .to(`user:${req.user.id}`)
        .emit("unread:update", { conversationId: id, unread: 0 });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Unread count (user)
app.get(
  "/api/messages/unread-count",
  authRequired,
  loadUser,
  async (req, res) => {
    try {
      if (!db.listUserConversations)
        return res.status(501).json({ error: "Driver missing conversations" });
      const rows = await Promise.resolve(db.listUserConversations(req.user.id));
      const unread = rows.reduce(
        (sum, r) => sum + Number(r.user_unread || 0),
        0
      );
      res.json({ unread });
    } catch (e) {
      res.status(500).json({ error: String(e?.message || e) });
    }
  }
);

app.get("/api/products", async (req, res) => {
  try {
    const { q, category, sort } = req.query;
    // If driver has getProducts with filtering, use it; otherwise emulate
    const raw = await Promise.resolve(db.getProducts({ q, category, sort }));
    if (Array.isArray(raw)) return res.json(raw);
    // Fallback path: get all and filter locally (ensure awaited)
    let items = await Promise.resolve(db.getProducts());
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

// Admin: basic Products CRUD (JSON driver supports full CRUD; MySQL not implemented)
app.get(
  "/api/admin/products",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (_req, res) => {
    try {
      const items = await Promise.resolve(db.getProducts());
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

app.post(
  "/api/admin/products",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (req, res) => {
    try {
      if (typeof db.createProduct !== "function")
        return res
          .status(501)
          .json({ error: "Driver does not support product creation" });
      const created = await Promise.resolve(db.createProduct(req.body || {}));
      res.status(201).json(created);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

app.patch(
  "/api/admin/products/:id",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (req, res) => {
    try {
      if (typeof db.updateProduct !== "function")
        return res
          .status(501)
          .json({ error: "Driver does not support product update" });
      const updated = await Promise.resolve(
        db.updateProduct(req.params.id, req.body || {})
      );
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

app.delete(
  "/api/admin/products/:id",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (req, res) => {
    try {
      if (typeof db.deleteProduct !== "function")
        return res
          .status(501)
          .json({ error: "Driver does not support product deletion" });
      const ok = await Promise.resolve(db.deleteProduct(req.params.id));
      if (!ok) return res.status(404).json({ error: "Not found" });
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

// Developers (used by Developers page)
app.get("/api/developers", async (_req, res) => {
  try {
    if (typeof db.getDevelopers !== "function") {
      return res.status(501).json({ error: "Driver missing getDevelopers" });
    }
    const data = await Promise.resolve(db.getDevelopers());
    res.json(data);
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

// Admin: Offers CRUD
app.get(
  "/api/admin/offers",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (_req, res) => {
    try {
      if (!db.adminListOffers)
        return res.status(501).json({ error: "Driver missing offers admin" });
      const rows = await Promise.resolve(db.adminListOffers());
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

app.post(
  "/api/admin/offers",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (req, res) => {
    try {
      if (!db.adminCreateOffer)
        return res.status(501).json({ error: "Driver missing create offer" });
      const created = await Promise.resolve(
        db.adminCreateOffer(req.body || {})
      );
      res.status(201).json(created);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

app.patch(
  "/api/admin/offers/:id",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (req, res) => {
    try {
      if (!db.adminUpdateOffer)
        return res.status(501).json({ error: "Driver missing update offer" });
      const updated = await Promise.resolve(
        db.adminUpdateOffer(req.params.id, req.body || {})
      );
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

app.delete(
  "/api/admin/offers/:id",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (req, res) => {
    try {
      if (!db.adminDeleteOffer)
        return res.status(501).json({ error: "Driver missing delete offer" });
      const ok = await Promise.resolve(db.adminDeleteOffer(req.params.id));
      if (!ok) return res.status(404).json({ error: "Not found" });
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

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

// User: get a single order they own
app.get("/api/orders/:id", authRequired, loadUser, async (req, res) => {
  try {
    const id = req.params.id;
    if (!db.getOrderById)
      return res.status(501).json({ error: "Driver missing getOrderById" });
    const order = await Promise.resolve(db.getOrderById(id));
    if (!order) return res.status(404).json({ error: "Not found" });
    if (order.user && order.user.id && order.user.id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Admin: list all orders regardless of user
app.get(
  "/api/admin/orders",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (_req, res) => {
    try {
      const data = await Promise.resolve(db.getOrders({}));
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

// Admin: update order status
app.patch(
  "/api/admin/orders/:id/status",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (req, res) => {
    try {
      const id = req.params.id;
      const { status } = req.body || {};
      const VALID = ["Processing", "Pending", "Delivered"];
      if (!VALID.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      if (!db.updateOrderStatus) {
        return res
          .status(501)
          .json({ error: "Driver does not support status updates" });
      }
      const updated = await Promise.resolve(db.updateOrderStatus(id, status));
      if (!updated) return res.status(404).json({ error: "Order not found" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

// ---------------- Messaging (Admin) ----------------
// List all conversations (admin)
app.get(
  "/api/admin/messages",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (_req, res) => {
    try {
      const rows = await Promise.resolve(db.adminListConversations());
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

// Get conversation + messages (admin)
app.get(
  "/api/admin/messages/:id",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const conv = await Promise.resolve(db.adminGetConversation(id));
      if (!conv) return res.status(404).json({ error: "Not found" });
      const msgs = await Promise.resolve(db.listMessages(id));
      res.json({ conversation: conv, messages: msgs });
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

// Mark read (admin)
app.post(
  "/api/admin/messages/:id/read",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const conv = await Promise.resolve(db.adminGetConversation(id));
      if (!conv) return res.status(404).json({ error: "Not found" });
      if (!db.markReadForAdmin)
        return res
          .status(501)
          .json({ error: "Driver missing markReadForAdmin" });
      await Promise.resolve(db.markReadForAdmin(id));
      return res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e?.message || e) });
    }
  }
);

// Reply (admin)
app.post(
  "/api/admin/messages/:id/reply",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { message, imageUrl } = req.body || {};
      if (!message && !imageUrl)
        return res.status(400).json({ error: "Missing message or image" });
      const conv = await Promise.resolve(db.adminGetConversation(id));
      if (!conv) return res.status(404).json({ error: "Not found" });
      await Promise.resolve(
        db.addMessage(id, "admin", req.user.id, message || "", imageUrl || null)
      );
      if (global.__io)
        global.__io
          .to(`user:${conv.user_id}`)
          .emit("message:new", { conversationId: id, from: "admin" });
      res.status(201).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

// Close or reopen conversation (admin)
app.patch(
  "/api/admin/messages/:id/status",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body || {};
      if (!status || !["open", "closed"].includes(status))
        return res.status(400).json({ error: "Invalid status" });
      const conv = await Promise.resolve(db.adminGetConversation(id));
      if (!conv) return res.status(404).json({ error: "Not found" });
      await Promise.resolve(db.setConversationStatus(id, status));
      if (global.__io)
        global.__io
          .to(`user:${conv.user_id}`)
          .emit("conversation:status", { conversationId: id, status });
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

// Delete conversation (admin)
app.delete(
  "/api/admin/messages/:id",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const ok = await Promise.resolve(db.adminDeleteConversation(id));
      if (!ok) return res.status(404).json({ error: "Not found" });
      if (global.__io)
        global.__io.to("admin").emit("conversation:deletedByAdmin", { id });
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

// Unread count (admin)
app.get(
  "/api/admin/messages/unread-count",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (_req, res) => {
    try {
      if (!db.adminListConversations)
        return res.status(501).json({ error: "Driver missing conversations" });
      const rows = await Promise.resolve(db.adminListConversations());
      const unread = rows.reduce(
        (sum, r) => sum + Number(r.admin_unread || 0),
        0
      );
      res.json({ unread });
    } catch (e) {
      res.status(500).json({ error: String(e?.message || e) });
    }
  }
);

app.post("/api/register", async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body || {};
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    // Normalize email/username to reduce duplicate collisions
    const emailId = String(email).trim();
    const usernameId = String(username).trim();
    // Separate uniqueness checks (email and username independently)
    const checkEmail =
      typeof db.findUserByEmail === "function"
        ? await Promise.resolve(db.findUserByEmail(emailId))
        : await Promise.resolve(db.findUserByEmailOrUsername(emailId));
    const checkUsername =
      typeof db.findUserByUsername === "function"
        ? await Promise.resolve(db.findUserByUsername(usernameId))
        : await Promise.resolve(db.findUserByEmailOrUsername(usernameId));
    if (checkEmail || checkUsername) {
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

// Admin: get single order by id
app.get(
  "/api/admin/orders/:id",
  authRequired,
  loadUser,
  roleRequired("admin"),
  async (req, res) => {
    try {
      if (!db.getOrderById)
        return res.status(501).json({ error: "Driver missing getOrderById" });
      const order = await Promise.resolve(db.getOrderById(req.params.id));
      if (!order) return res.status(404).json({ error: "Not found" });
      res.json(order);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);

// Socket.IO bootstrapping (with graceful fallback to normal listen)
try {
  const http = require("http");
  const jwt = require("jsonwebtoken");
  const httpServer = http.createServer(app);
  const { Server } = require("socket.io");
  const io = new Server(httpServer, { cors: { origin: "*" } });
  // Save globally for route handlers
  global.__io = io;
  io.use((socket, next) => {
    const token = socket.handshake.query?.token;
    if (token) {
      try {
        const payload = jwt.verify(token, config.JWT_SECRET || "secret");
        socket.data.user = payload;
        if (payload?.role === "admin") socket.join("admin");
        if (payload?.id) socket.join(`user:${payload.id}`);
      } catch {}
    }
    next();
  });
  httpServer.listen(PORT, () => {
    console.log(`Choco backend running on http://localhost:${PORT}`);
  });
} catch (e) {
  app.listen(PORT, () => {
    console.log(`Choco backend running on http://localhost:${PORT}`);
  });
}

// -------------------- Optional SPA hosting (single-service mode) --------------------
// If the frontend has been built into chocolate-candy/www, serve it statically from here.
// This lets a single Web Service host both API and the Angular SPA on Render free tier.
try {
  const webRoot = path.join(__dirname, "..", "..", "chocolate-candy", "www");
  if (fs.existsSync(webRoot)) {
    app.use(express.static(webRoot));

    // Public (read-only) DB info for quick browser checks
    app.get("/api/db-info", async (_req, res) => {
      try {
        const mysqlDriver = require("./mysql");
        const pool = mysqlDriver.getPool();
        const [[catRow]] = await pool.query(
          "SELECT COUNT(*) AS c FROM categories"
        );
        const [[prodRow]] = await pool.query(
          "SELECT COUNT(*) AS c FROM products"
        );
        const [[userRow]] = await pool.query("SELECT COUNT(*) AS c FROM users");
        const [[orderRow]] = await pool.query(
          "SELECT COUNT(*) AS c FROM orders"
        );
        const [[vRow]] = await pool.query("SELECT VERSION() AS version");
        res.json({
          driver: "mysql",
          mysql: {
            version: vRow.version,
            categories: catRow.c,
            products: prodRow.c,
            users: userRow.c,
            orders: orderRow.c,
          },
        });
      } catch (e) {
        res.status(500).json({ error: String(e?.message || e) });
      }
    });
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
  