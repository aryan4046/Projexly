const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { sendNotification } = require("../services/notificationService");

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

    // 1. Check if user already exists in main collection
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash password and OTP
    const hashedPassword = await bcrypt.hash(password, 10);
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(rawOtp, 10);

    // Fallback: Log OTP to console for development/testing
    console.log(`[AUTH] OTP for ${email}: ${rawOtp}`);

    // 3. Upsert to PendingUser (updates if already pending)
    await PendingUser.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password: hashedPassword,
        role: role || "student",
        otp: otpHash,
        createdAt: Date.now() // Reset the 10-min countdown
      },
      { upsert: true, new: true }
    );

    // 4. Send Email reliably
    try {
      await sendEmail({
        to: email,
        subject: "Projexly - Verify your email",
        text: `Your OTP is ${rawOtp}. It is valid for 10 minutes.`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">Welcome to Projexly! 🚀</h2>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${rawOtp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: center;">Enter this code to complete your registration.</p>
        </div>
        `,
      });

      // 5. Respond success
      res.status(201).json({
        message: "Registration successful. Please verify your email.",
        requiresOTP: true,
        email: email,
      });
    } catch (err) {
      console.error("Registration Email Error:", err);
      // Delete the pending user if email failed so they can try again
      await PendingUser.deleteOne({ email });
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

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

    if (!user.isVerified) {
      // Generate a new OTP if trying to log in but unverified
      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = await bcrypt.hash(rawOtp, 10);
      user.otpExpires = new Date(Date.now() + 60 * 1000); // 60 seconds
      await user.save();

      // Fallback: Log OTP to console for development/testing
      console.log(`[AUTH] Login OTP for ${user.email}: ${rawOtp}`);

      try {
        await sendEmail({
          to: user.email,
          subject: "Projexly - Verify your email",
          text: `Your new OTP is ${rawOtp}. It is valid for 60 seconds.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #4f46e5; text-align: center;">Projexly Authentication 🔐</h2>
              <p style="color: #334155; font-size: 16px;">Welcome back!</p>
              <p style="color: #334155; font-size: 16px;">To help keep your account safe, we require a quick verification. Please use the following One-Time Password (OTP) to proceed with your login:</p>
              <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${rawOtp}</span>
              </div>
              <p style="color: #ef4444; font-size: 14px; text-align: center; font-weight: bold;">⚠️ For your security, this code will expire in exactly 60 seconds.</p>
              <p style="color: #64748b; font-size: 14px; text-align: center;">Enter this code promptly to gain access to your account.</p>
              <p style="color: #64748b; font-size: 14px; margin-top: 20px;">If you didn't request this code or attempt to log in, please reset your password immediately and secure your account.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
              <p style="color: #94a3b8; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Projexly. All rights reserved.</p>
            </div>
          `,
        });

        return res.status(403).json({
          message: "Email not verified. A new OTP has been sent.",
          requiresOTP: true,
          email: user.email
        });
      } catch (err) {
        console.error("Login OTP Email Error:", err);
        return res.status(500).json({ message: "Failed to send OTP. Please try again later." });
      }
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

    // Trigger Welcome Back Notification
    await sendNotification(req.app, {
      recipient: user._id,
      type: "welcome",
      title: "Welcome Back! 👋",
      message: `Glad to see you again, ${user.name}! Ready to get some work done?`,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// VERIFY OTP
// ==============================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    // Find in PendingUser first
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      // If not in pending, check if they are already verified in User
      const alreadyVerified = await User.findOne({ email });
      if (alreadyVerified) {
        return res.status(400).json({ message: "User is already verified" });
      }
      return res.status(400).json({ message: "OTP expired or invalid session. Please register again." });
    }

    // Check OTP
    const isMatch = await bcrypt.compare(otp, pendingUser.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 1. Create the official User
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
      isVerified: true
    });

    // 2. Delete from PendingUser
    await PendingUser.deleteOne({ email });

    res.json({
      message: "Email verified successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id, user.role),
    });

    // Trigger New User Welcome Notification
    await sendNotification(req.app, {
      recipient: user._id,
      type: "welcome",
      title: "Welcome to Projexly! 🚀",
      message: `We're excited to have you here, ${user.name}. Let's start building something great together!`,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// RESEND OTP
// ==============================
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide an email" });
    }

    // Look in PendingUser (unverified)
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(400).json({ message: "Session expired. Please register again." });
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    pendingUser.otp = await bcrypt.hash(rawOtp, 10);
    pendingUser.createdAt = Date.now(); // Reset TTL
    await pendingUser.save();

    // Fallback: Log OTP to console for development/testing
    console.log(`[AUTH] Resend OTP for ${email}: ${rawOtp}`);

    try {
      await sendEmail({
        to: email,
        subject: "Projexly - New OTP Request",
        text: `Your new OTP is ${rawOtp}.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #4f46e5; text-align: center;">New OTP Code 🔐</h2>
            <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${rawOtp}</span>
            </div>
          </div>
        `,
      });
      res.json({ message: "A new OTP has been sent." });
    } catch (err) {
      console.error("Resend OTP Email Error:", err);
      res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }
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

    // Trigger Profile Updated Notification
    await sendNotification(req.app, {
      recipient: updatedUser._id,
      type: "profile_update",
      title: "Profile Updated ✨",
      message: "Your profile information has been successfully updated.",
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

// ==============================
// GET USER BY ID
// ==============================
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
