const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");

const {
  switchRole,
  getMe,
  updateProfile,
  deleteUser,
} = require("../controllers/userController");

// Get current user
router.get("/me", protect, getMe);

// Update profile
router.put("/profile", protect, updateProfile);

// Delete account
router.delete("/profile", protect, deleteUser);

// Switch between student and freelancer
router.put("/switch-role", protect, switchRole);

module.exports = router;
