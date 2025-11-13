#!/usr/bin/env node
/**
 * Simple diagnostic script: logs database driver, counts, and MySQL version if applicable.
 * Usage: node scripts/db-info.js [--json]
 * If you pass --json it will output raw JSON only.
 */
const config = require("../src/config");
const driverFlag = config.DB_DRIVER;

(async () => {
  try {
    if (driverFlag === "mysql") {
      const mysqlDriver = require("../src/mysql");
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
    } else {
      const jsonCore = require("../src/db");
      const data = jsonCore.load();
      const out = {
        driver: "json",
        counts: {
          categories: data.categories?.length || 0,
          products: data.products?.length || 0,
          users: data.users?.length || 0,
          orders: data.orders?.length || 0,
        },
      };
      if (process.argv.includes("--json")) {
        process.stdout.write(JSON.stringify(out));
      } else {
        console.log("[db-info] JSON driver");
        console.log("[db-info] Counts:", out.counts);
      }
    }
  } catch (e) {
    console.error("[db-info] Error:", e?.message || e);
    process.exit(1);
  }
})();
