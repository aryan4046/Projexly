const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        type: {
            type: String,
            enum: ["proposal_new", "proposal_accepted", "order_status", "message"],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Index for faster queries of unread notifications for a specific user
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
