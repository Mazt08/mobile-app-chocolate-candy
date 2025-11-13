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
      } catch (e) {
        console.warn("[DB] order_meta ensure failed:", e?.message || e);
      }
    })();
  }
  return pool;
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
    "SELECT title, subtitle, badge, target_sort AS sort, target_category AS category FROM offers"
  );
  // Map to frontend shape
  return rows.map((r) => ({
    title: r.title,
    subtitle: r.subtitle,
    badge: r.badge,
    target: r.category
      ? { category: r.category }
      : r.sort
      ? { sort: r.sort }
      : {},
  }));
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
      meta,
    };
  } catch (e) {
    await conn.rollback();
    throw e;
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
      "SELECT id, name, username, email, password, role FROM users WHERE email = ? OR username = ? LIMIT 1",
      [identity, identity]
    );
    return rows[0];
  },
  async findUserById(id) {
    const [rows] = await getPool().query(
      "SELECT id, name, username, email, password, role FROM users WHERE id = ? LIMIT 1",
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
      "SELECT id, name, username, email, role FROM users ORDER BY id"
    );
    return rows;
  },
};
