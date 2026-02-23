const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["student", "freelancer"],
            default: "student",
        },
        otp: { type: String, required: true },
        createdAt: { type: Date, default: Date.now } // No automatic deletion
    }
);

module.exports = mongoose.model("PendingUser", pendingUserSchema);
