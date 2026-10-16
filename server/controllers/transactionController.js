const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const categories = require("../categories");

const validId = (id) => mongoose.isValidObjectId(id);
const DAY = 24 * 60 * 60 * 1000;

function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;
  const d = new Date(value.slice(0, 10) + "T00:00:00.000Z");
  return isNaN(d) ? null : d;
}

// Validates and whitelists fields from the request body
function cleanTransaction(body) {
  const title = String(body.title ?? "").trim();
  const type = body.type;
  const category = String(body.category ?? "").trim();
  const amount = typeof body.amount === "string" ? Number(body.amount) : body.amount;
  const date = parseDate(body.date);
  const description = String(body.description ?? "").trim();

  if (!title) return { error: "Title is required" };
  if (title.length > 100) return { error: "Title must be 100 characters or fewer" };
  if (!["income", "expense"].includes(type)) return { error: "Type must be income or expense" };
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return { error: "Amount must be a positive number" };
  if (amount > 1e9) return { error: "Amount is too large" };
  if (!categories[type].includes(category)) return { error: `Category must be one of: ${categories[type].join(", ")}` };
  if (!date) return { error: "Enter a valid date (YYYY-MM-DD)" };
  if (description.length > 300) return { error: "Description must be 300 characters or fewer" };
  return { data: { title, type, category, amount: Math.round(amount * 100) / 100, date, description } };
}

// Builds a safe Mongo filter from whitelisted query params only
function buildFilter(userId, q) {
  const filter = { userId: new mongoose.Types.ObjectId(userId) };
  if (["income", "expense"].includes(q.type)) filter.type = q.type;
  if (typeof q.category === "string" && q.category) filter.category = q.category;
  const start = q.startDate ? parseDate(String(q.startDate)) : null;
  const end = q.endDate ? parseDate(String(q.endDate)) : null;
  if (q.startDate && !start) return { error: "Invalid start date" };
  if (q.endDate && !end) return { error: "Invalid end date" };
  if (start && end && start > end) return { error: "Start date must be before end date" };
  if (start || end) {
    filter.date = {};
    if (start) filter.date.$gte = start;
    if (end) filter.date.$lt = new Date(end.getTime() + DAY); // inclusive end day
  }
  if (typeof q.search === "string" && q.search.trim()) {
    const escaped = q.search.trim().slice(0, 50).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.title = { $regex: escaped, $options: "i" };
  }
  return { filter };
}

exports.list = async (req, res, next) => {
  try {
    const { filter, error } = buildFilter(req.user._id, req.query);
    if (error) return res.status(400).json({ message: error });
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 500);
    const items = await Transaction.find(filter).sort({ date: -1, createdAt: -1 }).limit(limit);
    res.json(items);
  } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid transaction ID" });
    const t = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!t) return res.status(404).json({ message: "Transaction not found" });
    res.json(t);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const { data, error } = cleanTransaction(req.body);
    if (error) return res.status(400).json({ message: error });
    const t = await Transaction.create({ ...data, userId: req.user._id });
    res.status(201).json(t);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid transaction ID" });
    const { data, error } = cleanTransaction(req.body);
    if (error) return res.status(400).json({ message: error });
    const t = await Transaction.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, data, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ message: "Transaction not found" });
    res.json(t);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid transaction ID" });
    const t = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!t) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Transaction deleted" });
  } catch (e) { next(e); }
};

exports.summary = async (req, res, next) => {
  try {
    const { filter, error } = buildFilter(req.user._id, { startDate: req.query.startDate, endDate: req.query.endDate });
    if (error) return res.status(400).json({ message: error });
    const rows = await Transaction.aggregate([{ $match: filter }, { $group: { _id: "$type", total: { $sum: "$amount" } } }]);
    const totalIncome = rows.find((r) => r._id === "income")?.total || 0;
    const totalExpenses = rows.find((r) => r._id === "expense")?.total || 0;
    res.json({ totalIncome, totalExpenses, balance: totalIncome - totalExpenses });
  } catch (e) { next(e); }
};

exports.analytics = async (req, res, next) => {
  try {
    const { filter, error } = buildFilter(req.user._id, { startDate: req.query.startDate, endDate: req.query.endDate });
    if (error) return res.status(400).json({ message: error });
    const [byCategory, monthly] = await Promise.all([
      Transaction.aggregate([
        { $match: { ...filter, type: "expense" } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        { $match: filter },
        { $group: { _id: { month: { $dateToString: { format: "%Y-%m", date: "$date", timezone: "UTC" } }, type: "$type" }, total: { $sum: "$amount" } } },
      ]),
    ]);
    const months = {};
    monthly.forEach(({ _id, total }) => {
      months[_id.month] = months[_id.month] || { month: _id.month, income: 0, expenses: 0 };
      if (_id.type === "income") months[_id.month].income = total;
      else months[_id.month].expenses = total;
    });
    res.json({
      expenseByCategory: byCategory.map((c) => ({ category: c._id, total: c.total })),
      monthly: Object.values(months).sort((a, b) => a.month.localeCompare(b.month)),
    });
  } catch (e) { next(e); }
};
