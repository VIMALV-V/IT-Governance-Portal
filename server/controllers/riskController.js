const Risk = require("../models/Risk");
const logAudit = require("../utils/auditLogger");

// CREATE RISK
const createRisk = async (req, res) => {
  try {
    const { title, description, severity, mitigation } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const risk = await Risk.create({
      title: title.trim(),
      description: description.trim(),
      severity: severity || "Low",
      mitigation: mitigation?.trim() || "",
      createdBy: req.user._id,
    });

    await logAudit(req.user._id, "Created Risk", risk.title);

    res.status(201).json({
      message: "Risk created successfully",
      risk,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL RISKS
const getRisks = async (req, res) => {
  try {
    const risks = await Risk.find().populate("createdBy", "name email").sort({ createdAt: -1 });
    res.json(risks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE RISK STATUS
const updateRiskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Open", "In Progress", "Resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const risk = await Risk.findById(req.params.id);

    if (!risk) {
      return res.status(404).json({ message: "Risk not found" });
    }

    risk.status = status;
    const updatedRisk = await risk.save();

    await logAudit(req.user._id, "Updated Risk Status", risk.title);

    res.json({
      message: "Risk status updated",
      updatedRisk,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRisk,
  getRisks,
  updateRiskStatus,
};
