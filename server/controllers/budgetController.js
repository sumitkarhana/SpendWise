const mongoose = require("mongoose");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const categories = require("../categories");

function readPeriod(src) {
  const now = new Date();
  const month = parseInt(src.month ?? now.getUTCMonth() + 1);
  const year = parseInt(src.year ?? now.getUTCFullYear());
  if (!(month >= 1 && month <= 12) || !(year >= 2000 && year <= 2100)) return null;
  return { month, year };
}
const parseAmount = (v) => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) && n > 0 && n <= 1e9 ? Math.round(n * 100) / 100 : null;
};

exports.list = async (req, res, next) => {
  try {
    const period = readPeriod(req.query);
    if (!period) return res.status(400).json({ message: "Invalid month or year" });
    const { month, year } = period;
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const [budgets, spent] = await Promise.all([
      Budget.find({ userId: req.user._id, month, year }).sort({ category: 1 }),
      Transaction.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user._id), type: "expense", date: { $gte: start, $lt: end } } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
      ]),
    ]);
    const spentMap = Object.fromEntries(spent.map((s) => [s._id, s.total]));
    res.json(budgets.map((b) => ({ ...b.toObject(), spent: spentMap[b.category] || 0 })));
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const period = readPeriod(req.body);
    const amount = parseAmount(req.body.amount);
    const category = String(req.body.category || "");
    if (!period) return res.status(400).json({ message: "Invalid month or year" });
    if (!categories.expense.includes(category)) return res.status(400).json({ message: "Choose a valid expense category" });
    if (amount === null) return res.status(400).json({ message: "Budget must be a positive number" });
    const b = await Budget.create({ userId: req.user._id, category, amount, ...period });
    res.status(201).json(b);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "A budget for this category and month already exists" });
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid budget ID" });
    const amount = parseAmount(req.body.amount);
    if (amount === null) return res.status(400).json({ message: "Budget must be a positive number" });
    const b = await Budget.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { amount }, { new: true });
    if (!b) return res.status(404).json({ message: "Budget not found" });
    res.json(b);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid budget ID" });
    const b = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!b) return res.status(404).json({ message: "Budget not found" });
    res.json({ message: "Budget deleted" });
  } catch (e) { next(e); }
};
