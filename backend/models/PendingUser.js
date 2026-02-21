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
        createdAt: { type: Date, default: Date.now, expires: 600 } // Deletes automatically after 10 minutes (600 seconds)
    }
);

module.exports = mongoose.model("PendingUser", pendingUserSchema);
