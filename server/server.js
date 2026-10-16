require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const required = ["MONGODB_URI", "JWT_SECRET", "CLIENT_URL"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: process.env.CLIENT_URL.split(","), credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// CSRF protection: state-changing requests must carry a custom header.
// Browsers only allow this cross-origin when CORS permits the origin.
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (req.get("X-Requested-With") !== "SpendWise") {
    return res.status(403).json({ message: "Missing required request header" });
  }
  next();
});

app.get("/", (req, res) => res.json({ message: "SpendWise API is running" }));
app.get("/api/health", (req, res) =>
  res.json({ message: "SpendWise API is running", db: mongoose.connection.readyState === 1 ? "connected" : "unavailable" })
);

// Return 503 for data routes if the database is down
app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: "Database unavailable. Try again shortly." });
  next();
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/budgets", require("./routes/budgetRoutes"));
app.use("/api/categories", (req, res) => res.json(require("./categories")));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid JSON body" });
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
