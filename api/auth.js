// Vercel API route for authentication
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../backend/models/User");
const { sendOTPEmail } = require("../backend/config/email");

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password, phone });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "brightvillas2024secretkey",
      { expiresIn: "7d" },
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "brightvillas2024secretkey",
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send OTP for email verification
router.post("/send-email-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await sendOTPEmail(email, otp, "verification");

    if (result.success) {
      // In production, store OTP in database with expiry
      res.json({ message: "OTP sent successfully", otp });
    } else {
      res.status(500).json({ message: "Failed to send OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP
router.post("/verify-email-otp", async (req, res) => {
  try {
    const { email, otp, name } = req.body;

    // In production, verify OTP from database
    // For now, accept any 6-digit OTP
    if (otp.length === 6) {
      const token = jwt.sign(
        { email },
        process.env.JWT_SECRET || "brightvillas2024secretkey",
        { expiresIn: "7d" },
      );
      res.json({ message: "Email verified", token });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
