const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "investrwanda",
  password: "kagaba",
  port: 5174, // <-- this matches your PostgreSQL terminal
});


// Test connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected successfully:", res.rows);
  }
});

module.exports = pool;
