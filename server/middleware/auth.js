const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function protect(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Please log in" });
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id).select("_id name email");
    if (!user) return res.status(401).json({ message: "Account no longer exists" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please log in again" });
  }
};
