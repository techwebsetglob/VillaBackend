// Vercel Serverless API Entry Point
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI;

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Error:", err));
}

// Import Routes
const authRoutes = require("./auth");
const villasRoutes = require("../backend/routes/villas");
const bookingsRoutes = require("../backend/routes/bookings");
const adminRoutes = require("../backend/routes/admin");
const contactRoutes = require("../backend/routes/contact");

// Use Routes
app.use("/auth", authRoutes);
app.use("/villas", villasRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/admin", adminRoutes);
app.use("/contact", contactRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Bright Villas API Running" });
});

module.exports = app;
