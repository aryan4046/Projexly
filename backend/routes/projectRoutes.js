const express = require("express");
const router = express.Router();

const protect = require("../middleware/protect");
const allowRole = require("../middleware/roleMiddleware");

const {
  createProject,
  getMyProjects,
  getOpenProjects,
  getProjectById,
} = require("../controllers/projectController");

router.post("/", protect, allowRole("student"), createProject);
router.get("/my-projects", protect, allowRole("student"), getMyProjects);
router.get("/open", protect, allowRole("freelancer"), getOpenProjects);
router.get("/:id", protect, getProjectById);

module.exports = router;
