#!/usr/bin/env node
/**
 * Simple diagnostic script: logs database driver, counts, and MySQL version if applicable.
 * Usage: node scripts/db-info.js [--json]
 * If you pass --json it will output raw JSON only.
 */
// MySQL-only diagnostics

(async () => {
  try {
    const mysqlDriver = require("../src/mysql");
    const pool = mysqlDriver.getPool();
    const [[catRow]] = await pool.query("SELECT COUNT(*) AS c FROM categories");
    const [[prodRow]] = await pool.query("SELECT COUNT(*) AS c FROM products");
    const [[userRow]] = await pool.query("SELECT COUNT(*) AS c FROM users");
    const [[orderRow]] = await pool.query("SELECT COUNT(*) AS c FROM orders");
    const [[vRow]] = await pool.query("SELECT VERSION() AS version");
    const out = {
      driver: "mysql",
      version: vRow.version,
      counts: {
        categories: catRow.c,
        products: prodRow.c,
        users: userRow.c,
        orders: orderRow.c,
      },
    };
    if (process.argv.includes("--json")) {
      process.stdout.write(JSON.stringify(out));
    } else {
      console.log("[db-info] MySQL version:", out.version);
      console.log("[db-info] Counts:", out.counts);
    }
  } catch (e) {
    console.error("[db-info] Error:", e?.message || e);
    process.exit(1);
  }
})();
