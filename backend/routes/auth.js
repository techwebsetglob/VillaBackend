const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, generateToken } = require("../middleware/auth");
const crypto = require("crypto");
const { sendOTPEmail } = require("../config/email");
const { sendSMS } = require("../config/twilio");
const { uploadSingle } = require("../middleware/upload");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth login/register
// @access  Public
router.post("/google", async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    // Check if user exists with Google ID or email
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with same email (registered normally)
      user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        if (!user.avatar && avatar) user.avatar = avatar;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          name,
          email: email.toLowerCase(),
          googleId,
          avatar: avatar || "",
          isVerified: true,
        });
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists
    if (!user) {
      return res.json({
        message: "If an account exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).hexString();
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with reset link
    await sendOTPEmail(email, resetToken, "password-reset");

    res.json({
      message: "If an account exists, a password reset link has been sent",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash the token to match stored token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true },
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/password
// @desc    Update password
// @access  Private
router.put("/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Check current password (if user has password - Google users may not)
    if (user.password) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/send-email-otp
// @desc    Send OTP to email
// @access  Public
router.post("/send-email-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new temporary user
      user = new User({
        name: "",
        email: email.toLowerCase(),
        password: Math.random().toString(36).slice(-8),
        emailOTP: otp,
        emailOTPExpires: Date.now() + 600000, // 10 minutes
        isEmailVerified: false,
      });
    } else {
      user.emailOTP = otp;
      user.emailOTPExpires = Date.now() + 600000;
    }

    await user.save();

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp, "verification");

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
    }

    // Always return OTP in response (for development and fallback)
    res.json({
      message: "OTP sent to your email",
      otp: otp,
    });
  } catch (error) {
    console.error("Error in send-email-otp:", error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/verify-email-otp
// @desc    Verify email OTP and login/register
// @access  Public
router.post("/verify-email-otp", async (req, res) => {
  try {
    const { email, otp, name } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
      emailOTP: otp,
      emailOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // If it's a new user (name was empty), update the name
    if (!user.name && name) {
      user.name = name;
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/send-phone-otp
// @desc    Send OTP to phone
// @access  Public
router.post("/send-phone-otp", async (req, res) => {
  try {
    const { phone, countryCode } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const fullPhone = (countryCode || "+91") + phone;
    
    let user = await User.findOne({ phone, countryCode: countryCode || "+91" });

    if (!user) {
      user = new User({
        name: "",
        email: `temp_${Date.now()}@temp.com`,
        password: Math.random().toString(36).slice(-8),
        phone,
        countryCode: countryCode || "+91",
        phoneOTP: otp,
        phoneOTPExpires: Date.now() + 600000,
        isPhoneVerified: false,
      });
    } else {
      user.phoneOTP = otp;
      user.phoneOTPExpires = Date.now() + 600000;
    }

    await user.save();

    // Send OTP via Twilio SMS
    const message = `Your Bright Villas verification code is: ${otp}. This code expires in 10 minutes.`;
    await sendSMS(fullPhone, message);

    // Always return OTP in response (for development and fallback)
    res.json({
      message: "OTP sent to your phone",
      otp: otp,
    });
  } catch (error) {
    console.error("Error sending phone OTP:", error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/verify-phone-otp
// @desc    Verify phone OTP and login/register
// @access  Public
router.post("/verify-phone-otp", async (req, res) => {
  try {
    const { phone, countryCode, otp, name } = req.body;

    const user = await User.findOne({
      phone,
      countryCode: countryCode || "+91",
      phoneOTP: otp,
      phoneOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // If it's a new user (name was empty), update the name
    if (!user.name && name) {
      user.name = name;
    }

    // Mark phone as verified
    user.isPhoneVerified = true;
    user.phoneOTP = undefined;
    user.phoneOTPExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/avatar
// @desc    Upload avatar image
// @access  Private
router.post("/avatar", protect, uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const avatarUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true },
    );

    res.json({
      message: "Avatar uploaded successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
