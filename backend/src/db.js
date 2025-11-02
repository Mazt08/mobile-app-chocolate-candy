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
};
