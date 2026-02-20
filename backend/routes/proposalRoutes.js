const express = require("express");
const router = express.Router();

const protect = require("../middleware/protect");
const allowRole = require("../middleware/roleMiddleware");

const { createProposal, getMyProposals, getReceivedProposals, getProjectProposals, acceptProposal, rejectProposal } = require("../controllers/proposalController");

router.post("/", protect, allowRole("freelancer"), createProposal);
router.get("/my-proposals", protect, allowRole("freelancer"), getMyProposals);
router.get("/received", protect, getReceivedProposals); // New route for clients
router.get("/project/:projectId", protect, getProjectProposals);
router.put("/:id/accept", protect, acceptProposal);
router.put("/:id/reject", protect, rejectProposal);

module.exports = router;
