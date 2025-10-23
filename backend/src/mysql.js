const mysql = require("mysql2/promise");
const config = require("./config");

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.MYSQL.host,
      port: config.MYSQL.port,
      user: config.MYSQL.user,
      password: config.MYSQL.password,
      database: config.MYSQL.database,
      waitForConnections: true,
      connectionLimit: 10,
    });
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

async function getOrders() {
  // Fetch orders and items, then group
  const [orders] = await getPool().query(
    "SELECT id, date, status, total FROM orders ORDER BY id DESC"
  );
  if (!orders.length) return [];
  const ids = orders.map((o) => o.id);
  const [items] = await getPool().query(
    `SELECT order_id, product_id AS id, name, price, qty FROM order_items WHERE order_id IN (${ids
      .map(() => "?")
      .join(",")})`,
    ids
  );
  const byOrder = new Map();
  for (const o of orders) byOrder.set(o.id, { ...o, items: [] });
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
      "INSERT INTO orders (id, date, status, total) VALUES (?, ?, ?, ?)",
      [id, date, status, total]
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
};
