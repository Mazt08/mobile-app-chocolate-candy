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
  getOrders() {
    return load().orders;
  },
  getDevelopers() {
    return load().developers;
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
    db.orders = [order, ...(db.orders || [])];
    save(db);
    return order;
  },
};
