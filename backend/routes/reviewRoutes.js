const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const {
    createReview,
    getGigReviews,
} = require("../controllers/reviewController");

router.post("/", protect, createReview);
router.get("/gig/:gigId", getGigReviews);

module.exports = router;
