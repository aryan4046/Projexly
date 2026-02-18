const Order = require("../models/Order");
const Gig = require("../models/Gig");

// ==============================
// CREATE ORDER
// ==============================
exports.createOrder = async (req, res) => {
    try {
        const { gigId, requirements } = req.body;

        const gig = await Gig.findById(gigId);
        if (!gig) return res.status(404).json({ message: "Gig not found" });

        // Prevent ordering own gig
        if (gig.freelancer.toString() === req.user.id) {
            return res.status(400).json({ message: "Cannot order your own gig" });
        }

        const order = await Order.create({
            gig: gigId,
            buyer: req.user.id,
            seller: gig.freelancer,
            price: gig.price,
            requirements,
            status: "active",
        });

        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ==============================
// GET ORDER BY ID
// ==============================
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("gig")
            .populate("buyer", "name email")
            .populate("seller", "name email");

        if (!order) return res.status(404).json({ message: "Order not found" });

        // Access control
        if (
            order.buyer._id.toString() !== req.user.id &&
            order.seller._id.toString() !== req.user.id
        ) {
            return res.status(401).json({ message: "Not authorized" });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ==============================
// GET MY ORDERS
// ==============================
exports.getMyOrders = async (req, res) => {
    try {
        // Orders where user is buyer OR seller
        const orders = await Order.find({
            $or: [{ buyer: req.user.id }, { seller: req.user.id }],
        })
            .populate("gig")
            .populate("buyer", "name")
            .populate("seller", "name")
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ==============================
// DELIVER ORDER (Freelancer)
// ==============================
exports.deliverOrder = async (req, res) => {
    try {
        const { deliveredFiles } = req.body; // Array of URLs
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.seller.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

        order.deliveredWork = deliveredFiles;
        await order.save();

        res.json({ message: "Work delivered", order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

// ==============================
// COMPLETE/CANCEL ORDER
// ==============================
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: "Order not found" });

        // Logic for who can do what
        // Seller can cancel. Buyer can complete (accept) or cancel.
        // For simplicity:
        if (order.buyer.toString() !== req.user.id && order.seller.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        order.status = status;
        if (status === "completed") {
            order.isCompleted = true;
        }
        await order.save();

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
