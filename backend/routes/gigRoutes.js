const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const {
    createGig,
    getAllGigs,
    getGigById,
    updateGig,
    deleteGig,
    getMyGigs,
} = require("../controllers/gigController");

router.get("/", getAllGigs);
router.get("/my-gigs", protect, getMyGigs);
router.get("/:id", getGigById);
router.post("/", protect, createGig);
router.put("/:id", protect, updateGig);
router.delete("/:id", protect, deleteGig);

module.exports = router;
