// POST /api/logout  -> removes the login cookie
const { clearSession } = require("./_auth");

module.exports = function handler(req, res) {
  if (req.method !== "POST") { return res.status(405).json({ error: "Use POST." }); }
  clearSession(res);
  return res.status(200).json({ ok: true });
};
