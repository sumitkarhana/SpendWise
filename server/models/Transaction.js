const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 100 },
  amount: { type: Number, required: true, min: [0.01, "Amount must be positive"] },
  type: { type: String, required: true, enum: ["income", "expense"] },
  category: { type: String, required: [true, "Category is required"], trim: true },
  date: { type: Date, required: [true, "Date is required"] },
  description: { type: String, trim: true, maxlength: 300, default: "" },
  createdAt: { type: Date, default: Date.now },
});
transactionSchema.index({ userId: 1, date: -1 });
module.exports = mongoose.model("Transaction", transactionSchema);
