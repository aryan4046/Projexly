const Proposal = require("../models/Proposal");
const Project = require("../models/Project");
const { sendNotification } = require("../services/notificationService");

// CREATE PROPOSAL
exports.createProposal = async (req, res) => {
  try {
    const { projectId, message, bidAmount } = req.body;
    console.log(`[API] Creating proposal for project: ${projectId} by user: ${req.user._id}`);

    const proposal = await Proposal.create({
      project: projectId,
      freelancer: req.user._id,
      bidAmount,
      message,
    });

    console.log(`[API] Proposal created: ${proposal._id}`);

    // Trigger Notification for the Project Owner (Student)
    const project = await Project.findById(projectId);
    if (project) {
      await sendNotification(req.app, {
        recipient: project.student,
        sender: req.user._id,
        type: "proposal_new",
        title: "New Proposal Received",
        message: `You received a new proposal for your project: ${project.title}`,
        relatedId: proposal._id,
      });
    }

    res.status(201).json(proposal);
  } catch (error) {
    console.error("[API] Create Proposal Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET MY PROPOSALS (Freelancer)
// GET MY PROPOSALS (Freelancer)
exports.getMyProposals = async (req, res) => {
  try {
    console.log(`[API] Fetching proposals for user: ${req.user._id}`);

    // 1. Fetch proposals
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate("project", "title status budget")
      .sort({ createdAt: -1 });

    console.log(`[API] Found ${proposals.length} proposals`);

    // 2. Return as array (defensive check not strictly needed if mongoose works, but good for safety)
    res.json(Array.isArray(proposals) ? proposals : []);
  } catch (error) {
    console.error("[API] Get My Proposals Error:", error);
    // Return empty array on error prevents frontend crash, but status 500 is stricter. 
    // Let's stick to 500 but ensure JSON format.
    res.status(500).json({ message: "Server error fetching proposals", error: error.message });
  }
};

// GET PROPOSALS FOR PROJECT (Client)
exports.getProjectProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ project: req.params.projectId })
      .populate("freelancer", "name email")
      .sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// ACCEPT PROPOSAL & CREATE ORDER (Client)
exports.acceptProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethodId } = req.body; // Mock payment token

    console.log(`[API] Accepting proposal ${id} by user ${req.user._id}`);

    const proposal = await Proposal.findById(id).populate("project");
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // Verify project ownership (optional but good practice)
    // const project = await Project.findById(proposal.project._id);
    // if (project.client.toString() !== req.user.id) ... 

    // 1. Mock Payment Processing
    if (!paymentMethodId) {
      return res.status(400).json({ message: "Payment method required" });
    }
    console.log(`[PAYMENT] Processing mock payment for amount: ${proposal.bidAmount}`);

    // 2. Update Proposal Status
    proposal.status = "accepted";
    await proposal.save();

    // 3. Update Project Status? (Maybe 'active' or 'in_progress')
    // proposal.project.status = 'active'; // If project model supports it
    // await proposal.project.save();

    // 4. Create Order
    const Order = require("../models/Order");
    const order = await Order.create({
      gig: null, // It's a project proposal, not a gig
      project: proposal.project._id, // Add this field to Order model if needed or reuse 'gig' field contextually
      buyer: req.user._id, // Student
      seller: proposal.freelancer,
      price: proposal.bidAmount,
      requirements: proposal.message, // Or empty
      status: "active",
      isProjectOrder: true // Flag to distinguish
    });

    console.log(`[API] Order created: ${order._id}`);

    // Trigger Notification for the Freelancer (Seller)
    await sendNotification(req.app, {
      recipient: proposal.freelancer,
      sender: req.user._id,
      type: "proposal_accepted",
      title: "Proposal Accepted!",
      message: `Your proposal for "${proposal.project.title}" has been accepted. An order has been created.`,
      relatedId: order._id,
    });

    res.json({ message: "Proposal accepted and order created", order });
  } catch (error) {
    console.error("[API] Accept Proposal Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// REJECT PROPOSAL (Client)
exports.rejectProposal = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[API] Rejecting proposal ${id} by user ${req.user._id}`);

    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    proposal.status = "rejected";
    await proposal.save();

    res.json({ message: "Proposal rejected", proposal });
  } catch (error) {
    console.error("[API] Reject Proposal Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// GET RECEIVED PROPOSALS (Student/Client)
exports.getReceivedProposals = async (req, res) => {
  try {
    console.log(`[API] Fetching received proposals for user: ${req.user._id}`);

    // 1. Find all projects owned by the user
    const projects = await Project.find({ student: req.user._id }).select('_id');
    const projectIds = projects.map(p => p._id);

    if (projectIds.length === 0) {
      return res.json([]);
    }

    // 2. Find proposals for these projects
    const proposals = await Proposal.find({ project: { $in: projectIds } })
      .populate("project", "title status budget")
      .populate("freelancer", "name email")
      .sort({ createdAt: -1 });

    console.log(`[API] Found ${proposals.length} received proposals`);
    res.json(proposals);
  } catch (error) {
    console.error("[API] Get Received Proposals Error:", error);
    res.status(500).json({ message: "Server error fetching received proposals" });
  }
};
