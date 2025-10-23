const express = require("express");
const cors = require("cors");
const db = require("./dbDriver");
const config = require("./config");

const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json());

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

app.get("/api/orders", async (_req, res) => {
  try {
    const data = await Promise.resolve(db.getOrders());
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const payload = req.body || {};
    const data = await Promise.resolve(db.createOrder(payload));
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.get("/api/developers", async (_req, res) => {
  try {
    const data = await Promise.resolve(db.getDevelopers());
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`Choco backend running on http://localhost:${PORT}`);
});
