const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax", // "none" is needed when frontend and API are on different domains
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sendUser(res, user, status = 200) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, cookieOptions);
  res.status(status).json({ id: user._id, name: user.name, email: user.email });
}

exports.register = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!emailRe.test(email)) return res.status(400).json({ message: "Enter a valid email" });
    if (password.length < 8 || password.length > 72) return res.status(400).json({ message: "Password must be 8 to 72 characters" });
    if (await User.findOne({ email })) return res.status(409).json({ message: "An account with this email already exists" });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    sendUser(res, user, 201);
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) return res.status(401).json({ message: "Incorrect email or password" });
    sendUser(res, user);
  } catch (e) { next(e); }
};

exports.logout = (req, res) => {
  const { maxAge, ...opts } = cookieOptions;
  res.clearCookie("token", opts);
  res.json({ message: "Logged out" });
};

exports.me = (req, res) => res.json({ id: req.user._id, name: req.user.name, email: req.user.email });
