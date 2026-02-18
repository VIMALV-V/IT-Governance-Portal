const Request = require("../models/Request");
const logAudit = require("../utils/auditLogger");
const sendNotification = require("../utils/notificationService");

// SUBMIT REQUEST
const submitRequest = async (req, res) => {
  try {
    const { title, description } = req.body;

    const request = await Request.create({
      title,
      description,
      submittedBy: req.user._id
    });

    // Audit log
    await logAudit(
      req.user._id,
      "Submitted Request",
      title
    );

    res.status(201).json({
      message: "Request submitted successfully",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER REQUESTS
const getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      submittedBy: req.user._id
    });

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL REQUESTS (Manager/Admin)
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("submittedBy", "name email role")
      .populate("reviewedBy", "name email role");

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// APPROVE / REJECT REQUEST
const reviewRequest = async (req, res) => {
  try {
    const { status } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();

    const updatedRequest = await request.save();

    // Audit log
    await logAudit(
      req.user._id,
      `${status} Request`,
      request.title
    );

    res.json({
      message: `Request ${status}`,
      updatedRequest
    });

    await sendNotification(
  request.submittedBy,
  `Your request "${request.title}" has been ${status}`
);


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { submitRequest, getUserRequests , getAllRequests, reviewRequest};
