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

    // 2. Prepare OTP & Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Fallback: Log OTP to console VERY LOUDLY for Render logs
    console.log("========================================");
    console.log(`[AUTH] OTP FOR ${email}: ${rawOtp}`);
    console.log("========================================");


    // 3. [DISABLED FOR NOW] Upsert to PendingUser (updates if already pending)
    /*
    await PendingUser.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password: hashedPassword,
        role: role || "student",
        otp: rawOtp, // Store plain OTP for speed
        createdAt: Date.now() // Reset the 10-min countdown
      },
      { upsert: true, new: true }
    );
    */

    // 3. [NEW] Create official User directly (Bypassing OTP)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
      isVerified: true
    });

    // 4. [DISABLED FOR NOW] Send Email reliably
    /*
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
          </div>
          `,
      });

      // 5. Respond success ONLY if email worked
      return res.status(201).json({
        message: "Registration successful. Please verify your email.",
        requiresOTP: true,
        email: email,
      });
    } catch (err) {
      console.error(`[AUTH] CRITICAL Error: Registration Email failed for ${email}: ${err.message}`);
      return res.status(500).json({ 
        message: "Email delivery failed. Please check server logs or try again.",
        error: err.message 
      });
    }
    */

    // 4. [NEW] Respond success immediately
    return res.status(201).json({
      message: "Registration successful. Welcome to Projexly!",
      user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role },
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
    if (!user.password) {
      return res.status(400).json({ message: "This email is associated with a social login. Please use Google or GitHub to sign in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    /*
    if (!user.isVerified) {
      // Generate a new OTP (Plain-text for speed)
      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = rawOtp;
      user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await user.save();

      // Fallback: Log OTP to console VERY LOUDLY for Render logs
      console.log("========================================");
      console.log(`[AUTH] LOGIN OTP FOR ${user.email}: ${rawOtp}`);
      console.log("========================================");


      // Send Email
      try {
        await sendEmail({
          to: user.email,
          subject: "Projexly - Verify your email",
          text: `Your new OTP is ${rawOtp}. It is valid for 5 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #4f46e5; text-align: center;">Projexly Authentication 🔐</h2>
              <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${rawOtp}</span>
              </div>
              <p style="color: #ef4444; font-size: 14px; text-align: center; font-weight: bold;">⚠️ Valid for 5 minutes.</p>
            </div>
          `,
        });

        return res.status(403).json({
          message: "Email not verified. A new OTP has been sent.",
          requiresOTP: true,
          email: user.email
        });
      } catch (err) {
        console.error(`[AUTH] CRITICAL Error: Login OTP Email failed for ${user.email}: ${err.message}`);
        return res.status(500).json({ 
          message: "Could not send verification email. Please try again later.",
          error: err.message
        });
      }

    }
    */

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id, user.role),
    });

    // Trigger Welcome Back Notification (De-coupled: Fire and forget)
    sendNotification(req.app, {
      recipient: user._id,
      type: "welcome",
      title: "Welcome Back! 👋",
      message: `Glad to see you again, ${user.name}! Ready to get some work done?`,
    }).catch(err => {
      console.error(`[NOTIFICATION] Background Welcome Notification failed for ${user._id}`);
      console.error(`[NOTIFICATION] Error Details: ${err.message}`);
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

    // 1. Check PendingUser (Registration Flow)
    const pendingUser = await PendingUser.findOne({ email });
    if (pendingUser) {
      if (otp !== pendingUser.otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Create official User
      const user = await User.create({
        name: pendingUser.name,
        email: pendingUser.email,
        password: pendingUser.password,
        role: pendingUser.role,
        isVerified: true
      });

      // Delete from PendingUser
      await PendingUser.deleteOne({ email });

      const token = generateToken(user._id, user.role);
      
      // Trigger Welcome Notification
      sendNotification(req.app, {
        recipient: user._id,
        type: "welcome",
        title: "Welcome to Projexly! 🚀",
        message: `We're excited to have you here, ${user.name}. Let's start building!`,
      }).catch(err => console.error(`[NOTIFICATION] Error: ${err.message}`));

      return res.json({
        message: "Email verified successfully.",
        user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role },
        token
      });
    }

    // 2. Check main User collection (Login verification flow)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Account not found. Please register." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Check OTP and Expiry
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires && new Date() > user.otpExpires) {
      return res.status(400).json({ message: "OTP has expired. Please resend." });
    }

    // Verify User
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    return res.json({
      message: "Login successful and email verified.",
      user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });

  } catch (error) {
    console.error(`[AUTH] Verify OTP Error:`, error);
    res.status(500).json({ message: "Server error during verification" });
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

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. Check PendingUser
    const pendingUser = await PendingUser.findOne({ email });
    if (pendingUser) {
      pendingUser.otp = rawOtp;
      pendingUser.createdAt = Date.now();
      await pendingUser.save();

      // Fallback: Log OTP to console VERY LOUDLY for Render logs
      console.log("========================================");
      console.log(`[AUTH] RESEND OTP (Pending) FOR ${email}: ${rawOtp}`);
      console.log("========================================");


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

        return res.json({ message: "A new OTP has been sent." });
      } catch (err) {
        console.error(`[AUTH] Resend Email Error (Pending): ${err.message}`);
        return res.status(500).json({ message: "Resend failed. Email service down.", error: err.message });
      }

    }

    // 2. Check main User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Account not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    user.otp = rawOtp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    // Fallback: Log OTP to console VERY LOUDLY for Render logs
    console.log("========================================");
    console.log(`[AUTH] RESEND OTP (User) FOR ${email}: ${rawOtp}`);
    console.log("========================================");


    // Send Email
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

      return res.json({ message: "A new OTP has been sent." });
    } catch (err) {
      console.error(`[AUTH] CRITICAL Error: Resend Email failed for ${email}: ${err.message}`);
      return res.status(500).json({ 
        message: "Resend failed. Email service might be down.",
        error: err.message
      });
    }


  } catch (error) {
    console.error(`[AUTH] Resend OTP Error:`, error);
    res.status(500).json({ message: "Server error during resending OTP" });
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
