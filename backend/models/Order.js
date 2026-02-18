const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        gig: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gig",
            required: false, // Changed to false to support Project orders
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: false,
        },
        isProjectOrder: { type: Boolean, default: false },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        price: { type: Number, required: true },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active",
        },
        requirements: { type: String },
        isCompleted: { type: Boolean, default: false },
        deliveredWork: [{ type: String }], // URLs to delivered files
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
