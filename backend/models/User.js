const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for OAuth users
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    role: {
      type: String,
      enum: ["student", "freelancer"],
      default: "student",
    },
    // Profile Fields
    headline: { type: String, default: "" },
    location: { type: String, default: "" },
    about: { type: String, default: "" },
    skills: [{ type: String }],
    languages: [
      {
        language: { type: String },
        level: { type: String },
      },
    ],
    education: [
      {
        school: { type: String },
        degree: { type: String },
        year: { type: String },
      },
    ],
    certification: [
      {
        name: { type: String },
        from: { type: String },
        year: { type: String },
      },
    ],
    portfolio: [{ type: String }], // URLs to images/projects
    notifications: {
      email: { type: Boolean, default: true },
      projectUpdates: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
