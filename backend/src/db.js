const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

function load() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (_e) {
    return {
      categories: [],
      products: [],
      offers: [],
      orders: [],
      developers: [],
      users: [],
    };
  }
}

function save(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

module.exports = {
  load,
  save,
  getCategories() {
    return load().categories;
  },
  getProducts() {
    return load().products;
  },
  createProduct(prod) {
    const db = load();
    const nextId =
      (db.products?.reduce((m, p) => Math.max(m, p.id || 0), 0) || 0) + 1;
    const item = {
      id: nextId,
      name: String(prod?.name || "").trim(),
      description: String(prod?.description || ""),
      price: Number(prod?.price || 0),
      weight: prod?.weight ?? "",
      img: String(prod?.img || ""),
      category: String(prod?.category || ""),
    };
    db.products = [...(db.products || []), item];
    save(db);
    return item;
  },
  updateProduct(id, patch) {
    const db = load();
    const idx = (db.products || []).findIndex((p) => p.id === Number(id));
    if (idx === -1) return null;
    const prev = db.products[idx];
    const next = {
      ...prev,
      ...(patch?.name !== undefined ? { name: String(patch.name) } : {}),
      ...(patch?.description !== undefined
        ? { description: String(patch.description) }
        : {}),
      ...(patch?.price !== undefined ? { price: Number(patch.price) } : {}),
      ...(patch?.weight !== undefined ? { weight: patch.weight } : {}),
      ...(patch?.img !== undefined ? { img: String(patch.img) } : {}),
      ...(patch?.category !== undefined
        ? { category: String(patch.category) }
        : {}),
    };
    db.products[idx] = next;
    save(db);
    return next;
  },
  deleteProduct(id) {
    const db = load();
    const before = db.products || [];
    const idx = before.findIndex((p) => p.id === Number(id));
    if (idx === -1) return false;
    before.splice(idx, 1);
    db.products = before;
    save(db);
    return true;
  },
  getOffers() {
    return load().offers;
  },
  getOrders(opts) {
    const db = load();
    const orders = db.orders || [];
    if (opts?.userId) {
      return orders.filter((o) => o.user?.id === Number(opts.userId));
    }
    return orders;
  },
  getDevelopers() {
    return load().developers;
  },
  updateOrderStatus(id, status) {
    const db = load();
    const orders = db.orders || [];
    const idx = orders.findIndex((o) => o.id === Number(id));
    if (idx === -1) return null;
    orders[idx] = { ...orders[idx], status };
    db.orders = orders;
    save(db);
    return orders[idx];
  },
  findUserByEmailOrUsername(identity) {
    const db = load();
    return (db.users || []).find(
      (u) => u.email === identity || u.username === identity
    );
  },
  findUserById(id) {
    const db = load();
    return (db.users || []).find((u) => u.id === Number(id));
  },
  createUser({ name, username, email, password, role }) {
    const db = load();
    const nextId =
      (db.users?.reduce((m, u) => Math.max(m, u.id || 0), 0) || 0) + 1;
    const user = {
      id: nextId,
      name,
      username,
      email,
      password, // NOTE: in JSON driver, stored as plain text for demo only
      role: role || "user",
    };
    db.users = [...(db.users || []), user];
    save(db);
    const { password: _pw, ...safe } = user;
    return safe;
  },
  listUsers() {
    const db = load();
    return (db.users || []).map(({ password, ...safe }) => safe);
  },
  createOrder(payload) {
    const db = load();
    const now = new Date();
    const nextId =
      (db.orders?.reduce((m, o) => Math.max(m, o.id || 0), 1000) || 1000) + 1;
    const order = {
      id: nextId,
      date: now.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "Processing",
      total: Number(payload?.total || 0),
      items: (payload?.items || []).map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price),
        qty: Number(i.qty),
      })),
      meta: {
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
      },
    };
    // Attach minimal user info when available
    if (payload?.userId) {
      const user = (db.users || []).find(
        (u) => u.id === Number(payload.userId)
      );
      if (user) {
        order.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      } else {
        order.user = { id: Number(payload.userId) };
      }
    }
    db.orders = [order, ...(db.orders || [])];
    save(db);
    return order;
  },
  getOrderById(id) {
    const db = load();
    return (db.orders || []).find((o) => o.id === Number(id)) || null;
  },
};
