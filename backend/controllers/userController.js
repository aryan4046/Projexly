const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ==============================
// REGISTER
// ==============================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// LOGIN
// ==============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// GET CURRENT USER
// ==============================
exports.getMe = async (req, res) => {
  res.json(req.user);
};

// ==============================
// SWITCH ROLE
// ==============================
exports.switchRole = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle role
    user.role = user.role === "student" ? "freelancer" : "student";

    await user.save();

    res.json({
      message: "Role switched successfully",
      newRole: user.role,
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// UPDATE PROFILE
// ==============================
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      headline,
      location,
      about,
      skills,
      languages,
      education,
      certification,
      portfolio,
      notifications,
    } = req.body;

    user.name = name !== undefined ? name : user.name;
    user.headline = headline !== undefined ? headline : user.headline;
    user.location = location !== undefined ? location : user.location;
    user.about = about !== undefined ? about : user.about;
    user.skills = skills !== undefined ? skills : user.skills;
    user.languages = languages !== undefined ? languages : user.languages;
    user.education = education !== undefined ? education : user.education;
    user.certification = certification !== undefined ? certification : user.certification;
    user.portfolio = portfolio !== undefined ? portfolio : user.portfolio;

    if (notifications) {
      user.notifications = { ...user.notifications, ...notifications };
    }

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        headline: updatedUser.headline,
        location: updatedUser.location,
        about: updatedUser.about,
        skills: updatedUser.skills,
        languages: updatedUser.languages,
        education: updatedUser.education,
        certification: updatedUser.certification,
        portfolio: updatedUser.portfolio,
        notifications: updatedUser.notifications,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// DELETE USER
// ==============================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.user._id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
