const Notification = require("../models/Notification");

/**
 * Create and send a notification
 * @param {Object} app - Express app instance to get io and userSockets
 * @param {Object} data - Notification data {recipient, sender, type, title, message, relatedId}
 */
const sendNotification = async (app, data) => {
    try {
        // 1. Save to Database
        const notification = await Notification.create(data);

        // 2. Populate sender info for the frontend
        const populatedNotification = await Notification.findById(notification._id)
            .populate("sender", "name profilePicture");

        // 3. Emit via Socket.io if user is connected
        const io = app.get("io");
        const userSockets = app.get("userSockets");
        const socketId = userSockets.get(data.recipient.toString());

        if (socketId) {
            io.to(socketId).emit("notification_received", populatedNotification);
            console.log(`[Notification] Emitted to user ${data.recipient}`);
        } else {
            console.log(`[Notification] User ${data.recipient} is offline. Saved to DB.`);
        }

        return populatedNotification;
    } catch (error) {
        console.error("[Notification Service] Error:", error);
    }
};

module.exports = { sendNotification };
