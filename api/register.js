// POST /api/register  { name, email, password }  -> creates the account and signs the user in
const bcrypt = require("bcryptjs");
const { db } = require("./_db");
const { setSession, validEmail } = require("./_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { return res.status(405).json({ error: "Use POST." }); }

  const body = req.body || {};
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!name || name.length > 60) { return res.status(400).json({ error: "Enter your name (up to 60 characters)." }); }
  if (!validEmail(email)) { return res.status(400).json({ error: "Enter a valid email address." }); }
  if (password.length < 6 || password.length > 72) { return res.status(400).json({ error: "Password must be 6 to 72 characters." }); }

  try {
    const pool = await db();
    const hash = await bcrypt.hash(password, 10);   // the real password is never stored
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hash]
    );
    const user = { id: result.insertId, name: name, email: email };
    setSession(res, user);
    return res.status(201).json({ user: user });
  } catch (e) {
    if (e && e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "An account with this email already exists. Try signing in." });
    }
    console.error("register failed:", e);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
};
