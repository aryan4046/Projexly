const Project = require("../models/Project");
const { sendNotification } = require("../services/notificationService");

// CREATE PROJECT
exports.createProject = async (req, res) => {
  try {
    const { title, description, budget, deadline } = req.body;

    const project = await Project.create({
      title,
      description,
      budget,
      deadline,
      student: req.user._id,
    });

    res.status(201).json(project);

    // Trigger Project Posted Notification
    await sendNotification(req.app, {
      recipient: req.user._id,
      type: "project_new",
      title: "Project Posted Successfully! 📈",
      message: `Your project "${title}" is now live and visible to freelancers.`,
      relatedId: project._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY PROJECTS
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      student: req.user._id,
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL OPEN PROJECTS (for freelancer)
exports.getOpenProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: "open" });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROJECT BY ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "student",
      "name email"
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
