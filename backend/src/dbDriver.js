const config = require("./config");

let impl = null;
if (config.DB_DRIVER === "mysql") {
  try {
    impl = require("./mysql");
    console.log("[DB] Using MySQL driver");
  } catch (e) {
    console.warn(
      "[DB] MySQL module not available, falling back to JSON:",
      e.message
    );
    impl = require("./db");
  }
} else {
  impl = require("./db");
  console.log("[DB] Using JSON file driver");
}

module.exports = impl;
