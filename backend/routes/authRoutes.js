const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const router = express.Router();

const { 
  register: registerUser,
  login: loginUser,
  verifyOTP,
  resendOTP,
} = require("../controllers/userController");
const { sendOTPEmail } = require("../utils/sendEmail");
const { sendNotification } = require("../services/notificationService");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Verify OTP
router.post("/verify-otp", verifyOTP);

// Resend OTP
router.post("/resend-otp", resendOTP);

// Helper to generate token for OAuth
const generateOAuthToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ==============================
// GOOGLE OAUTH ROUTES
// ==============================
router.get(
  "/google",
  (req, res, next) => {
    if (req.query.role) {
      req.session.oauthRole = req.query.role;
    }
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }),
  async (req, res) => {
    // Generate and save OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    req.user.otp = rawOtp;
    await req.user.save();

    // Fallback log
    console.log(`[AUTH] GOOGLE OTP FOR ${req.user.email}: ${rawOtp}`);

    // Send Email (Non-blocking for speed)
    sendOTPEmail(req.user.email, rawOtp).catch(err => {
      console.error(`[AUTH] Google OTP Email failed: ${err.message}`);
    });

    // Redirect to Login Page with OTP parameters
    res.redirect(`${FRONTEND_URL}/login?email=${req.user.email}&requiresOTP=true&oauth=true`);

    // Trigger Welcome Back Notification (still fire and forget, but maybe wait for verification?)
    // For now, let's just do it
    sendNotification(req.app, {
      recipient: req.user._id,
      type: "welcome",
      title: "Welcome Back! 👋",
      message: `Great to see you again, ${req.user.name}! You've logged in via Google.`,
    });
  }
);

// ==============================
// GITHUB OAUTH ROUTES
// ==============================
router.get(
  "/github",
  (req, res, next) => {
    if (req.query.role) {
      req.session.oauthRole = req.query.role;
    }
    next();
  },
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }),
  async (req, res) => {
    // Generate and save OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    req.user.otp = rawOtp;
    await req.user.save();

    // Fallback log
    console.log(`[AUTH] GITHUB OTP FOR ${req.user.email}: ${rawOtp}`);

    // Send Email (Non-blocking for speed)
    sendOTPEmail(req.user.email, rawOtp).catch(err => {
      console.error(`[AUTH] GitHub OTP Email failed: ${err.message}`);
    });

    // Redirect to Login Page with OTP parameters
    res.redirect(`${FRONTEND_URL}/login?email=${req.user.email}&requiresOTP=true&oauth=true`);

    // Trigger Welcome Back Notification
    sendNotification(req.app, {
      recipient: req.user._id,
      type: "welcome",
      title: "Welcome Back! 👋",
      message: `Great to see you again, ${req.user.name}! You've logged in via GitHub.`,
    });
  }
);

module.exports = router;
