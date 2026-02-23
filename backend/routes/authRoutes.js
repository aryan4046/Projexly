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

    // Send Email
    try {
      await sendEmail({
        to: req.user.email,
        subject: "Projexly - OAuth Verification Code",
        text: `Your verification code is ${rawOtp}.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #4f46e5; text-align: center;">OAuth Verification 🔐</h2>
            <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${rawOtp}</span>
            </div>
            <p style="text-align: center; color: #64748b;">Enter this code to complete your Google login.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error(`[AUTH] Google OTP Email failed: ${err.message}`);
    }

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

    // Send Email
    try {
      await sendEmail({
        to: req.user.email,
        subject: "Projexly - OAuth Verification Code",
        text: `Your verification code is ${rawOtp}.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #4f46e5; text-align: center;">OAuth Verification 🔐</h2>
            <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${rawOtp}</span>
            </div>
            <p style="text-align: center; color: #64748b;">Enter this code to complete your GitHub login.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error(`[AUTH] GitHub OTP Email failed: ${err.message}`);
    }

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
