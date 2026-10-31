// Database helper. Files starting with "_" are NOT public API routes on Vercel.
// It connects to MySQL using the environment variables you set in Vercel.
const mysql = require("mysql2/promise");

let pool = null;
let tableReady = false;

function getPool() {
  if (!pool) {
    const config = {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectionLimit: 3,   // keep small: serverless functions open many pools
      connectTimeout: 10000
    };
    // Most hosted MySQL services (Aiven, TiDB, Railway) require an encrypted connection.
    // Set DB_SSL=false in Vercel only if your provider does not use SSL.
    if (process.env.DB_SSL !== "false") {
      config.ssl = process.env.DB_CA
        ? { ca: process.env.DB_CA }                 // best: verify with the provider's CA certificate
        : { rejectUnauthorized: false };            // encrypted, but certificate not verified
    }
    pool = mysql.createPool(config);
  }
  return pool;
}

// Creates the users table the first time the API runs, so you don't have to.
async function db() {
  const p = getPool();
  if (!tableReady) {
    await p.query(
      "CREATE TABLE IF NOT EXISTS users (" +
      "id INT AUTO_INCREMENT PRIMARY KEY," +
      "name VARCHAR(100) NOT NULL," +
      "email VARCHAR(190) NOT NULL UNIQUE," +
      "password_hash VARCHAR(255) NOT NULL," +
      "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
      ")"
    );
    tableReady = true;
  }
  return p;
}

module.exports = { db };
