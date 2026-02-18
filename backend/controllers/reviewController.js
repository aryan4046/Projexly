const Review = require("../models/Review");
const Order = require("../models/Order");
const Gig = require("../models/Gig");

// ==============================
// CREATE REVIEW
// ==============================
exports.createReview = async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Verify completion
        if (!order.isCompleted) {
            return res.status(400).json({ message: "Order must be completed to review" });
        }

        // Determine roles
        // If Buyer is reviewing -> reviewee is seller
        let revieweeId;
        if (order.buyer.toString() === req.user.id) {
            revieweeId = order.seller;
        } else {
            return res.status(400).json({ message: "Only buyers can review gigs currently" });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ order: orderId, reviewer: req.user.id });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this order" });
        }

        const review = await Review.create({
            order: orderId,
            gig: order.gig,
            reviewer: req.user.id,
            reviewee: revieweeId,
            rating,
            comment
        });

        // Update Gig Rating
        const reviews = await Review.find({ gig: order.gig });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await Gig.findByIdAndUpdate(order.gig, {
            rating: avgRating,
            $inc: { reviewCount: 1 }
        });

        res.status(201).json(review);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ==============================
// GET REVIEWS FOR GIG
// ==============================
exports.getGigReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ gig: req.params.gigId })
            .populate("reviewer", "name");
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
