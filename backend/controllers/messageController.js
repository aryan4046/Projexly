const Message = require("../models/Message");
const User = require("../models/User");

// ==============================
// SEND MESSAGE
// ==============================
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;

        if (!message || !receiverId) {
            return res.status(400).json({ message: "Invalid data" });
        }

        const newMessage = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            message
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ==============================
// GET CONVERSATION WITH USER
// ==============================
exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: userId },
                { sender: userId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ==============================
// GET MY CONVERSATIONS (List of users)
// ==============================
exports.getConversations = async (req, res) => {
    try {
        // Distinct users messaged with
        const sent = await Message.find({ sender: req.user.id }).distinct('receiver');
        const received = await Message.find({ receiver: req.user.id }).distinct('sender'); // Returns ObjectIds

        // Combine unique IDs
        const userIds = [...new Set([...sent.map(id => id.toString()), ...received.map(id => id.toString())])];

        const users = await User.find({ _id: { $in: userIds } }, "name email role");

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
