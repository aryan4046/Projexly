const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const {
    createOrder,
    getOrderById,
    getMyOrders,
    updateOrderStatus,
    deliverOrder,
} = require("../controllers/orderController");

router.post("/", protect, createOrder);
router.get("/", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, updateOrderStatus);
router.put("/:id/deliver", protect, deliverOrder);

module.exports = router;
