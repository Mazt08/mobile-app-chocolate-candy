const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const config = require("./config");

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, "db.sql"), "utf-8");
  const conn = await mysql.createConnection({
    host: config.MYSQL.host,
    port: config.MYSQL.port,
    user: config.MYSQL.user,
    password: config.MYSQL.password,
    multipleStatements: true,
  });
  try {
    await conn.query(sql);
    console.log("MySQL seed complete.");
  } finally {
    await conn.end();
  }
}

run().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
