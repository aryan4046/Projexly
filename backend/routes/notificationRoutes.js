const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const {
    getNotifications,
    markAsRead,
    markAllRead,
} = require("../controllers/notificationController");

// Notification routes
router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markAsRead);
router.put("/read-all", protect, markAllRead);

module.exports = router;
