// GET /api/me  -> who is signed in right now? ({ user: null } if nobody)
const { getUser } = require("./_auth");

module.exports = function handler(req, res) {
  if (req.method !== "GET") { return res.status(405).json({ error: "Use GET." }); }
  res.setHeader("Cache-Control", "no-store");
  try {
    return res.status(200).json({ user: getUser(req) });
  } catch (e) {
    console.error("me failed:", e);
    return res.status(500).json({ error: "Server error." });
  }
};
