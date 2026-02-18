const mongoose = require("mongoose");

const gigSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        deliveryTime: { type: Number, required: true }, // in days
        revisions: { type: Number, default: 0 },
        features: [{ type: String }],
        images: [{ type: String }], // Array of URLs
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isActive: { type: Boolean, default: true },
        rating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Gig", gigSchema);
