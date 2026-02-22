const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
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
  (req, res) => {
    // Successful authentication
    const token = generateOAuthToken(req.user);
    res.redirect(`${FRONTEND_URL}/auth/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, isVerified: true }))}`);

    // Trigger Welcome Back Notification
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
  (req, res) => {
    // Successful authentication
    const token = generateOAuthToken(req.user);
    res.redirect(`${FRONTEND_URL}/auth/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, isVerified: true }))}`);

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
