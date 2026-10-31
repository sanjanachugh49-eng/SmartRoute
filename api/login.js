// POST /api/login  { email, password }  -> checks the password and signs the user in
const bcrypt = require("bcryptjs");
const { db } = require("./_db");
const { setSession, validEmail } = require("./_auth");

// Used when the email isn't found, so the response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { return res.status(405).json({ error: "Use POST." }); }

  const body = req.body || {};
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!validEmail(email) || !password) {
    return res.status(400).json({ error: "Enter your email and password." });
  }

  try {
    const pool = await db();
    const [rows] = await pool.execute(
      "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const row = rows[0];
    const ok = await bcrypt.compare(password, row ? row.password_hash : DUMMY_HASH);
    if (!row || !ok) {
      return res.status(401).json({ error: "Wrong email or password." });
    }
    const user = { id: row.id, name: row.name, email: row.email };
    setSession(res, user);
    return res.status(200).json({ user: user });
  } catch (e) {
    console.error("login failed:", e);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
};
