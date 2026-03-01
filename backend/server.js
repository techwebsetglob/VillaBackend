require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// CORS Configuration - Allow all Vercel frontends
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3001",
    "https://brightvillas.vercel.app",
    "https://brightvillas-r5q9oym9p-websetglobs-projects.vercel.app",
    "https://brightvillas-kygi1jfva-websetglobs-projects.vercel.app",
    "https://brightvillas-21hnkb558-websetglobs-projects.vercel.app",
    "https://brightvillasadmin.vercel.app",
  ],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
const MONGO_URI =
  "mongodb+srv://brightvillas:websetglob08@villa.kks1uus.mongodb.net/Villa01?appName=Villa";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected to Villa01"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Import Routes
const authRoutes = require("./routes/auth");
const villaRoutes = require("./routes/villas");
const bookingRoutes = require("./routes/bookings");
const adminRoutes = require("./routes/admin");
const contactRoutes = require("./routes/contact");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/villas", villaRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Bright Villas API Running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
