const mysql = require("mysql2/promise");
const config = require("./config");
const bcrypt = require("bcryptjs");

let pool;
function getPool() {
  if (!pool) {
    console.log(
      `[DB] Connecting MySQL ${config.MYSQL.user}@${config.MYSQL.host}:${config.MYSQL.port}/${config.MYSQL.database}`
    );
    pool = mysql.createPool({
      host: config.MYSQL.host,
      port: config.MYSQL.port,
      user: config.MYSQL.user,
      password: config.MYSQL.password,
      database: config.MYSQL.database,
      waitForConnections: true,
      connectionLimit: 10,
    });
    pool.on("error", (e) => {
      console.error("[DB] Pool error:", e?.message || e);
    });
    // Ensure auxiliary table for order metadata exists (idempotent)
    (async () => {
      try {
        await pool.query(
          "CREATE TABLE IF NOT EXISTS order_meta (order_id INT PRIMARY KEY, meta TEXT, CONSTRAINT fk_meta_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE)"
        );
        // Conversations and messages tables
        await pool.query(
          "CREATE TABLE IF NOT EXISTS conversations (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, subject VARCHAR(255) NOT NULL, status ENUM('open','closed') NOT NULL DEFAULT 'open', deleted_by_user TINYINT(1) NOT NULL DEFAULT 0, deleted_by_admin TINYINT(1) NOT NULL DEFAULT 0, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT fk_conv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)"
        );
        await pool.query(
          "CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, conversation_id INT NOT NULL, sender_role ENUM('user','admin') NOT NULL, sender_user_id INT NULL, body TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE)"
        );
        // Add unread counters and last-read timestamps, and optional image_url
        try {
          await pool.query(
            "ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_unread INT NOT NULL DEFAULT 0"
          );
        } catch (e) {}
        try {
          await pool.query(
            "ALTER TABLE conversations ADD COLUMN IF NOT EXISTS admin_unread INT NOT NULL DEFAULT 0"
          );
        } catch (e) {}
        try {
          await pool.query(
            "ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_read_user_at DATETIME NULL"
          );
        } catch (e) {}
        try {
          await pool.query(
            "ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_read_admin_at DATETIME NULL"
          );
        } catch (e) {}
        try {
          await pool.query(
            "ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url VARCHAR(512) NULL"
          );
        } catch (e) {}
        // Ensure new columns for offers and users.points exist (idempotent)
        try {
          await pool.query(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS points INT NOT NULL DEFAULT 0"
          );
        } catch (e) {}
        try {
          await pool.query(
            "ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_type ENUM('percent','fixed') NOT NULL DEFAULT 'percent'"
          );
        } catch (e) {}
        try {
          await pool.query(
            "ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) NOT NULL DEFAULT 0"
          );
        } catch (e) {}
        try {
          await pool.query(
            "ALTER TABLE offers ADD COLUMN IF NOT EXISTS points_cost INT NOT NULL DEFAULT 0"
          );
        } catch (e) {}
        try {
          await pool.query(
            "ALTER TABLE offers ADD COLUMN IF NOT EXISTS active TINYINT(1) NOT NULL DEFAULT 1"
          );
        } catch (e) {}
      } catch (e) {
        console.warn("[DB] order_meta ensure failed:", e?.message || e);
      }
    })();
  }
  return pool;
}

// ---------------- Conversations & Messages ----------------
async function createConversation(userId, subject, body) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.query(
      "INSERT INTO conversations (user_id, subject, admin_unread) VALUES (?, ?, ?)",
      [userId, String(subject || "").trim(), 1]
    );
    const convId = res.insertId;
    await conn.query(
      "INSERT INTO messages (conversation_id, sender_role, sender_user_id, body) VALUES (?,?,?,?)",
      [convId, "user", userId, String(body || "").trim()]
    );
    await conn.commit();
    return { id: convId, user_id: userId, subject, status: "open" };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function listUserConversations(userId) {
  const [rows] = await getPool().query(
    "SELECT id, subject, status, created_at, updated_at, user_unread FROM conversations WHERE user_id = ? AND deleted_by_user = 0 ORDER BY updated_at DESC",
    [userId]
  );
  return rows;
}

async function getConversationForUser(id, userId) {
  const [rows] = await getPool().query(
    "SELECT id, user_id, subject, status, created_at, updated_at, user_unread FROM conversations WHERE id = ? AND user_id = ? AND deleted_by_user = 0 LIMIT 1",
    [id, userId]
  );
  return rows[0] || null;
}

async function listMessages(conversationId) {
  const [rows] = await getPool().query(
    "SELECT id, sender_role, sender_user_id, body, image_url, created_at FROM messages WHERE conversation_id = ? ORDER BY id ASC",
    [conversationId]
  );
  return rows;
}

async function addMessage(
  conversationId,
  senderRole,
  senderUserId,
  body,
  imageUrl = null
) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.query(
      "INSERT INTO messages (conversation_id, sender_role, sender_user_id, body, image_url) VALUES (?,?,?,?,?)",
      [
        conversationId,
        senderRole,
        senderUserId || null,
        String(body || "").trim(),
        imageUrl,
      ]
    );
    if (senderRole === "user") {
      await conn.query(
        "UPDATE conversations SET admin_unread = admin_unread + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [conversationId]
      );
    } else {
      await conn.query(
        "UPDATE conversations SET user_unread = user_unread + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [conversationId]
      );
    }
    await conn.commit();
    return { id: res.insertId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function deleteConversationForUser(conversationId, userId) {
  // Soft delete for the user; if admin also deleted, hard delete via cascade by deleting conversation
  const [rows] = await getPool().query(
    "SELECT deleted_by_admin FROM conversations WHERE id = ? AND user_id = ?",
    [conversationId, userId]
  );
  if (!rows[0]) return false;
  const deletedByAdmin = !!rows[0].deleted_by_admin;
  if (deletedByAdmin) {
    await getPool().query("DELETE FROM conversations WHERE id = ?", [
      conversationId,
    ]);
    return true;
  }
  const [res] = await getPool().query(
    "UPDATE conversations SET deleted_by_user = 1 WHERE id = ? AND user_id = ?",
    [conversationId, userId]
  );
  return res.affectedRows > 0;
}

// Admin-side
async function adminListConversations() {
  const [rows] = await getPool().query(
    "SELECT id, user_id, subject, status, created_at, updated_at, admin_unread, deleted_by_user FROM conversations WHERE deleted_by_admin = 0 ORDER BY updated_at DESC"
  );
  return rows;
}

async function adminGetConversation(id) {
  const [rows] = await getPool().query(
    "SELECT id, user_id, subject, status, created_at, updated_at, admin_unread, deleted_by_user FROM conversations WHERE id = ? AND deleted_by_admin = 0 LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function adminDeleteConversation(id) {
  const [[row]] = await getPool().query(
    "SELECT deleted_by_user FROM conversations WHERE id = ?",
    [id]
  );
  if (!row) return false;
  const deletedByUser = !!row.deleted_by_user;
  if (deletedByUser) {
    await getPool().query("DELETE FROM conversations WHERE id = ?", [id]);
    return true;
  }
  const [res] = await getPool().query(
    "UPDATE conversations SET deleted_by_admin = 1 WHERE id = ?",
    [id]
  );
  return res.affectedRows > 0;
}

async function setConversationStatus(id, status) {
  const [res] = await getPool().query(
    "UPDATE conversations SET status = ? WHERE id = ?",
    [status, id]
  );
  return res.affectedRows > 0;
}

async function markReadForUser(id, userId) {
  const [res] = await getPool().query(
    "UPDATE conversations SET user_unread = 0, last_read_user_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return res.affectedRows > 0;
}

async function markReadForAdmin(id) {
  const [res] = await getPool().query(
    "UPDATE conversations SET admin_unread = 0, last_read_admin_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id]
  );
  return res.affectedRows > 0;
}

async function getCategories() {
  const [rows] = await getPool().query(
    "SELECT name FROM categories ORDER BY name"
  );
  return rows.map((r) => r.name);
}

async function getProducts(query = {}) {
  const { q, category, sort } = query;
  let sql = `SELECT p.id, p.name, p.description, p.price, p.weight, p.img, c.name AS category
             FROM products p JOIN categories c ON p.category_id = c.id`;
  const where = [];
  const params = [];
  if (q) {
    where.push("LOWER(p.name) LIKE ?");
    params.push(`%${String(q).toLowerCase()}%`);
  }
  if (category) {
    where.push("c.name = ?");
    params.push(category);
  }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  if (sort === "priceAsc") sql += " ORDER BY p.price ASC";
  else if (sort === "priceDesc") sql += " ORDER BY p.price DESC";
  else sql += " ORDER BY p.id ASC";
  const [rows] = await getPool().query(sql, params);
  return rows;
}

async function ensureCategoryId(name) {
  if (!name) {
    // default to first category if none provided
    const [rows] = await getPool().query(
      "SELECT id FROM categories ORDER BY id LIMIT 1"
    );
    return rows[0]?.id || null;
  }
  const [found] = await getPool().query(
    "SELECT id FROM categories WHERE name = ? LIMIT 1",
    [name]
  );
  if (found[0]?.id) return found[0].id;
  const [res] = await getPool().query(
    "INSERT INTO categories (name) VALUES (?)",
    [name]
  );
  return res.insertId;
}

async function createProduct(prod) {
  const categoryId = await ensureCategoryId(
    String(prod?.category || "").trim()
  );
  const name = String(prod?.name || "").trim();
  const description = String(prod?.description || "");
  const price = Number(prod?.price || 0);
  const weight = prod?.weight ?? "100g";
  const img = String(prod?.img || "");
  const [res] = await getPool().query(
    "INSERT INTO products (name, description, price, weight, img, category_id) VALUES (?,?,?,?,?,?)",
    [name, description, price, weight, img, categoryId]
  );
  const id = res.insertId;
  return {
    id,
    name,
    description,
    price,
    weight,
    img,
    category: String(prod?.category || ""),
  };
}

async function updateProduct(id, patch) {
  const fields = [];
  const params = [];
  if (patch?.name !== undefined) {
    fields.push("name = ?");
    params.push(String(patch.name));
  }
  if (patch?.description !== undefined) {
    fields.push("description = ?");
    params.push(String(patch.description));
  }
  if (patch?.price !== undefined) {
    fields.push("price = ?");
    params.push(Number(patch.price));
  }
  if (patch?.weight !== undefined) {
    fields.push("weight = ?");
    params.push(patch.weight);
  }
  if (patch?.img !== undefined) {
    fields.push("img = ?");
    params.push(String(patch.img));
  }
  if (patch?.category !== undefined) {
    const catId = await ensureCategoryId(String(patch.category));
    fields.push("category_id = ?");
    params.push(catId);
  }
  if (!fields.length) {
    // nothing to update, return current row
    const [rows] = await getPool().query(
      `SELECT p.id, p.name, p.description, p.price, p.weight, p.img, c.name AS category
       FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
      [id]
    );
    return rows[0] || null;
  }
  params.push(id);
  await getPool().query(
    `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
    params
  );
  const [rows] = await getPool().query(
    `SELECT p.id, p.name, p.description, p.price, p.weight, p.img, c.name AS category
     FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function deleteProduct(id) {
  const [res] = await getPool().query("DELETE FROM products WHERE id = ?", [
    id,
  ]);
  return res.affectedRows > 0;
}

async function getOffers() {
  const [rows] = await getPool().query(
    "SELECT id, title, subtitle, badge, target_sort AS sort, target_category AS category, discount_type, discount_value, points_cost, active FROM offers WHERE active = 1"
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    badge: r.badge,
    target: r.category
      ? { category: r.category }
      : r.sort
      ? { sort: r.sort }
      : {},
    discount_type: r.discount_type,
    discount_value: Number(r.discount_value),
    points_cost: Number(r.points_cost || 0),
    active: !!r.active,
  }));
}

// Admin Offers CRUD
async function adminListOffers() {
  const [rows] = await getPool().query(
    "SELECT id, title, subtitle, badge, target_sort AS sort, target_category AS category, discount_type, discount_value, points_cost, active FROM offers ORDER BY id DESC"
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    badge: r.badge,
    sort: r.sort,
    category: r.category,
    discount_type: r.discount_type,
    discount_value: Number(r.discount_value),
    points_cost: Number(r.points_cost || 0),
    active: !!r.active,
  }));
}

async function adminCreateOffer(input) {
  const title = String(input?.title || "").trim();
  const subtitle = String(input?.subtitle || "").trim();
  const badge = String(input?.badge || "").trim();
  const target_sort = input?.target?.sort || input?.sort || null;
  const target_category = input?.target?.category || input?.category || null;
  const discount_type = input?.discount_type === "fixed" ? "fixed" : "percent";
  const discount_value = Number(input?.discount_value || 0);
  const points_cost = Number(input?.points_cost || 0);
  const active = input?.active ? 1 : 0;
  const [res] = await getPool().query(
    "INSERT INTO offers (title, subtitle, badge, target_sort, target_category, discount_type, discount_value, points_cost, active) VALUES (?,?,?,?,?,?,?,?,?)",
    [
      title,
      subtitle,
      badge,
      target_sort,
      target_category,
      discount_type,
      discount_value,
      points_cost,
      active,
    ]
  );
  const id = res.insertId;
  return {
    id,
    title,
    subtitle,
    badge,
    sort: target_sort,
    category: target_category,
    discount_type,
    discount_value,
    points_cost,
    active: !!active,
  };
}

async function adminUpdateOffer(id, patch) {
  const fields = [];
  const params = [];
  if (patch?.title !== undefined) {
    fields.push("title = ?");
    params.push(String(patch.title));
  }
  if (patch?.subtitle !== undefined) {
    fields.push("subtitle = ?");
    params.push(String(patch.subtitle));
  }
  if (patch?.badge !== undefined) {
    fields.push("badge = ?");
    params.push(String(patch.badge));
  }
  if (patch?.sort !== undefined || patch?.target?.sort !== undefined) {
    fields.push("target_sort = ?");
    params.push(patch?.target?.sort ?? patch?.sort ?? null);
  }
  if (patch?.category !== undefined || patch?.target?.category !== undefined) {
    fields.push("target_category = ?");
    params.push(patch?.target?.category ?? patch?.category ?? null);
  }
  if (patch?.discount_type !== undefined) {
    const v = patch.discount_type === "fixed" ? "fixed" : "percent";
    fields.push("discount_type = ?");
    params.push(v);
  }
  if (patch?.discount_value !== undefined) {
    fields.push("discount_value = ?");
    params.push(Number(patch.discount_value));
  }
  if (patch?.points_cost !== undefined) {
    fields.push("points_cost = ?");
    params.push(Number(patch.points_cost));
  }
  if (patch?.active !== undefined) {
    fields.push("active = ?");
    params.push(patch.active ? 1 : 0);
  }
  if (!fields.length) {
    const [rows] = await getPool().query(
      "SELECT id, title, subtitle, badge, target_sort AS sort, target_category AS category, discount_type, discount_value, points_cost, active FROM offers WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  }
  params.push(id);
  await getPool().query(
    `UPDATE offers SET ${fields.join(", ")} WHERE id = ?`,
    params
  );
  const [rows] = await getPool().query(
    "SELECT id, title, subtitle, badge, target_sort AS sort, target_category AS category, discount_type, discount_value, points_cost, active FROM offers WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function adminDeleteOffer(id) {
  const [res] = await getPool().query("DELETE FROM offers WHERE id = ?", [id]);
  return res.affectedRows > 0;
}

async function getOrders(opts) {
  // Fetch orders, join users, and items, then group
  let sql = `SELECT o.id, o.date, o.status, o.total, o.user_id,
                    u.name AS user_name, u.email AS user_email
               FROM orders o
               LEFT JOIN users u ON u.id = o.user_id`;
  const params = [];
  if (opts?.userId) {
    sql += ` WHERE o.user_id = ?`;
    params.push(opts.userId);
  }
  sql += ` ORDER BY o.id DESC`;
  const [orders] = await getPool().query(sql, params);
  if (!orders.length) return [];
  const ids = orders.map((o) => o.id);
  const [items] = await getPool().query(
    `SELECT order_id, product_id AS id, name, price, qty FROM order_items WHERE order_id IN (${ids
      .map(() => "?")
      .join(",")})`,
    ids
  );
  const [metas] = await getPool().query(
    `SELECT order_id, meta FROM order_meta WHERE order_id IN (${ids
      .map(() => "?")
      .join(",")})`,
    ids
  );
  const metaMap = new Map();
  for (const m of metas) {
    try {
      metaMap.set(m.order_id, JSON.parse(m.meta));
    } catch {
      metaMap.set(m.order_id, null);
    }
  }
  const byOrder = new Map();
  for (const o of orders) {
    const base = {
      id: o.id,
      date: o.date,
      status: o.status,
      total: o.total,
      items: [],
      meta: metaMap.get(o.id) || undefined,
    };
    if (o.user_id)
      base["user"] = { id: o.user_id, name: o.user_name, email: o.user_email };
    byOrder.set(o.id, base);
  }
  for (const it of items)
    byOrder
      .get(it.order_id)
      .items.push({ id: it.id, name: it.name, price: it.price, qty: it.qty });
  return Array.from(byOrder.values());
}

async function getDevelopers() {
  const [rows] = await getPool().query(
    "SELECT name, role, github, img FROM developers ORDER BY id"
  );
  return rows;
}

async function createOrder(payload) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    // compute next id as max(id)+1 to match schema where id is not auto-increment
    const [r] = await conn.query(
      "SELECT COALESCE(MAX(id), 1000) + 1 AS nextId FROM orders"
    );
    const id = r[0].nextId;
    const date = new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const status = "Processing";
    const total = Number(payload?.total || 0);
    await conn.query(
      "INSERT INTO orders (id, date, status, total, user_id) VALUES (?, ?, ?, ?, ?)",
      [id, date, status, total, payload?.userId || null]
    );
    const items = (payload?.items || []).map((i) => [
      id,
      i.id,
      i.name,
      Number(i.price),
      Number(i.qty),
    ]);
    if (items.length) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES ?",
        [items]
      );
    }
    const meta = {
      promo: payload?.meta?.promo || "",
      discountLabel: payload?.meta?.discountLabel || "",
      payment: payload?.meta?.payment || "cod",
      contact: {
        name: payload?.meta?.contact?.name || "",
        phone: payload?.meta?.contact?.phone || "",
        address: payload?.meta?.contact?.address || "",
        city: payload?.meta?.contact?.city || "",
        notes: payload?.meta?.contact?.notes || "",
      },
    };
    await conn.query("INSERT INTO order_meta (order_id, meta) VALUES (?, ?)", [
      id,
      JSON.stringify(meta),
    ]);
    // Points handling
    let pointsSpent = 0;
    let pointsEarned = 0;
    if (payload?.userId) {
      const [usrRows] = await conn.query(
        "SELECT id, points FROM users WHERE id = ?",
        [payload.userId]
      );
      const user = usrRows[0];
      if (user) {
        const offerId = payload?.meta?.offerId || null;
        if (offerId) {
          const [offRows] = await conn.query(
            "SELECT points_cost FROM offers WHERE id = ? AND active = 1",
            [offerId]
          );
          const off = offRows[0];
          const cost = Number(off?.points_cost || 0);
          if (cost > 0) {
            if (Number(user.points) < cost) {
              throw new Error("Choco points are not enough");
            }
            pointsSpent = cost;
            await conn.query(
              "UPDATE users SET points = points - ? WHERE id = ?",
              [cost, payload.userId]
            );
          }
        }
        // Earn rule: 1 point per ₱100 (floor)
        pointsEarned = Math.floor(Number(total) / 100);
        if (pointsEarned > 0) {
          await conn.query(
            "UPDATE users SET points = points + ? WHERE id = ?",
            [pointsEarned, payload.userId]
          );
        }
      }
    }

    await conn.commit();
    return {
      id,
      date,
      status,
      total,
      items: (payload?.items || []).map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price),
        qty: Number(i.qty),
      })),
      meta: {
        ...meta,
        ...(payload?.meta?.offerId ? { offerId: payload.meta.offerId } : {}),
        ...(pointsSpent ? { pointsSpent } : {}),
        ...(pointsEarned ? { pointsEarned } : {}),
      },
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function addAdminUser() {
  const conn = await getPool().getConnection();
  try {
    const hashedPassword = await bcrypt.hash("@Admin123", 10);
    await conn.query(
      "INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)",
      ["Admin", "admin", "admin@gmail.com", hashedPassword, "admin"]
    );
    console.log("Admin user added successfully.");
  } catch (e) {
    console.error("Failed to add admin user:", e.message);
  } finally {
    conn.release();
  }
}

module.exports = {
  getCategories,
  getProducts,
  getOffers,
  getOrders,
  getDevelopers,
  createOrder,
  createProduct,
  updateProduct,
  deleteProduct,
  // expose pool for diagnostics endpoint
  getPool,
  // messaging (user)
  createConversation,
  listUserConversations,
  getConversationForUser,
  listMessages,
  addMessage,
  deleteConversationForUser,
  // messaging (admin)
  adminListConversations,
  adminGetConversation,
  adminDeleteConversation,
  setConversationStatus,
  markReadForUser,
  markReadForAdmin,
  // offers admin
  adminListOffers,
  adminCreateOffer,
  adminUpdateOffer,
  adminDeleteOffer,
  async updateOrderStatus(id, status) {
    await getPool().query("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    const [rows] = await getPool().query(
      "SELECT id, date, status, total, user_id FROM orders WHERE id = ?",
      [id]
    );
    if (!rows[0]) return null;
    const order = rows[0];
    const [items] = await getPool().query(
      "SELECT product_id AS id, name, price, qty FROM order_items WHERE order_id = ?",
      [id]
    );
    const [metas] = await getPool().query(
      "SELECT meta FROM order_meta WHERE order_id = ?",
      [id]
    );
    let meta;
    if (metas[0]?.meta) {
      try {
        meta = JSON.parse(metas[0].meta);
      } catch {}
    }
    let user;
    if (order.user_id) {
      const [u] = await getPool().query(
        "SELECT id, name, email, role FROM users WHERE id = ?",
        [order.user_id]
      );
      user = u[0] ? u[0] : undefined;
    }
    return {
      id: order.id,
      date: order.date,
      status: order.status,
      total: order.total,
      items: items.map((it) => ({
        id: it.id,
        name: it.name,
        price: it.price,
        qty: it.qty,
      })),
      ...(meta ? { meta } : {}),
      ...(user ? { user } : {}),
    };
  },
  async getOrderById(id) {
    const [orders] = await getPool().query(
      "SELECT id, date, status, total, user_id FROM orders WHERE id = ?",
      [id]
    );
    if (!orders[0]) return null;
    const order = orders[0];
    const [items] = await getPool().query(
      "SELECT product_id AS id, name, price, qty FROM order_items WHERE order_id = ?",
      [id]
    );
    const [metas] = await getPool().query(
      "SELECT meta FROM order_meta WHERE order_id = ?",
      [id]
    );
    let meta;
    if (metas[0]?.meta) {
      try {
        meta = JSON.parse(metas[0].meta);
      } catch {}
    }
    let user;
    if (order.user_id) {
      const [u] = await getPool().query(
        "SELECT id, name, email, role FROM users WHERE id = ?",
        [order.user_id]
      );
      user = u[0] ? u[0] : undefined;
    }
    return {
      id: order.id,
      date: order.date,
      status: order.status,
      total: order.total,
      items: items.map((it) => ({
        id: it.id,
        name: it.name,
        price: it.price,
        qty: it.qty,
      })),
      ...(meta ? { meta } : {}),
      ...(user ? { user } : {}),
    };
  },
  // Users API (used by server routes)
  async findUserByEmailOrUsername(identity) {
    const [rows] = await getPool().query(
      "SELECT id, name, username, email, password, role, points FROM users WHERE email = ? OR username = ? LIMIT 1",
      [identity, identity]
    );
    return rows[0];
  },
  async findUserByEmail(email) {
    const [rows] = await getPool().query(
      "SELECT id, name, username, email, password, role, points FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0];
  },
  async findUserByUsername(username) {
    const [rows] = await getPool().query(
      "SELECT id, name, username, email, password, role, points FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    return rows[0];
  },
  async findUserById(id) {
    const [rows] = await getPool().query(
      "SELECT id, name, username, email, password, role, points FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0];
  },
  async createUser({ name, username, email, password, role }) {
    const hashed = await bcrypt.hash(password, 10);
    const [res] = await getPool().query(
      "INSERT INTO users (name, username, email, password, role) VALUES (?,?,?,?,?)",
      [name, username, email, hashed, role || "user"]
    );
    return { id: res.insertId, name, username, email, role: role || "user" };
  },
  async listUsers() {
    const [rows] = await getPool().query(
      "SELECT id, name, username, email, role, points FROM users ORDER BY id"
    );
    return rows;
  },
  addAdminUser,
};
