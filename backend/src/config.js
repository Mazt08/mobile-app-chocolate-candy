require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_DRIVER: process.env.DB_DRIVER || "mysql", // mysql-only mode
  MYSQL: {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: +(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DB || "chocoapp",
  },
};
