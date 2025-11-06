const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const config = require("./config");
const bcrypt = require("bcryptjs");

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
    // Insert default users with hashed passwords
    const adminPass = await bcrypt.hash("@Admin123", 10);
    const staffPass = await bcrypt.hash("staff123!", 10);
    const userPass = await bcrypt.hash("user123!", 10);
    await conn.changeUser({ database: config.MYSQL.database });
    await conn.query(
      "INSERT INTO users (name, username, email, password, role) VALUES (?,?,?,?,?),(?,?,?,?,?),(?,?,?,?,?)",
      [
        "Admin",
        "admin",
        "admin@gmail.com",
        adminPass,
        "admin",
        "Staff One",
        "staff",
        "staff@choco.local",
        staffPass,
        "staff",
        "Sample User",
        "user",
        "user@choco.local",
        userPass,
        "user",
      ]
    );
    console.log("MySQL seed complete (schema + default users).");
  } finally {
    await conn.end();
  }
}

run().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
