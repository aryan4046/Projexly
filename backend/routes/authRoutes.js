const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

const {
  register: registerUser,
  login: loginUser,
  verifyOTP,
} = require("../controllers/userController");

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
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }),
  (req, res) => {
    // Successful authentication
    const token = generateOAuthToken(req.user);
    res.redirect(`${FRONTEND_URL}/auth/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }))}`);
  }
);

// ==============================
// GITHUB OAUTH ROUTES
// ==============================
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }),
  (req, res) => {
    // Successful authentication
    const token = generateOAuthToken(req.user);
    res.redirect(`${FRONTEND_URL}/auth/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }))}`);
  }
);

module.exports = router;
