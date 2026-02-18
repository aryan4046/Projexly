const express = require("express");
const router = express.Router();

const {
  register: registerUser,
  login: loginUser,
} = require("../controllers/userController");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

module.exports = router;
