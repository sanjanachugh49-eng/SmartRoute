// Helpers for the login cookie. The cookie is "httpOnly", so page JavaScript can't read it.
const jwt = require("jsonwebtoken");

const COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) { throw new Error("JWT_SECRET is missing or too short"); }
  return s;
}

function setSession(res, user) {
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, secret(), { expiresIn: MAX_AGE });
  res.setHeader("Set-Cookie",
    COOKIE + "=" + token + "; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=" + MAX_AGE);
}

function clearSession(res) {
  res.setHeader("Set-Cookie", COOKIE + "=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
}

function getUser(req) {
  const header = req.headers.cookie || "";
  const part = header.split(";").map(function (s) { return s.trim(); })
    .find(function (s) { return s.indexOf(COOKIE + "=") === 0; });
  if (!part) { return null; }
  try {
    const p = jwt.verify(part.slice(COOKIE.length + 1), secret());
    return { id: p.id, name: p.name, email: p.email };
  } catch (e) {
    return null;
  }
}

function validEmail(v) { return typeof v === "string" && v.length <= 190 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

module.exports = { setSession, clearSession, getUser, validEmail };
