const PolicyAcknowledgement = require("../models/PolicyAcknowledgement");

// ACKNOWLEDGE POLICY
const acknowledgePolicy = async (req, res) => {
  try {
    const { policyId } = req.body;

    // Check if already acknowledged
    const existing = await PolicyAcknowledgement.findOne({
      policy: policyId,
      user: req.user._id
    });

    if (existing) {
      return res.status(400).json({
        message: "Policy already acknowledged"
      });
    }

    const acknowledgement = await PolicyAcknowledgement.create({
      policy: policyId,
      user: req.user._id
    });

    res.status(201).json({
      message: "Policy acknowledged successfully",
      acknowledgement
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET COMPLIANCE STATUS
const getUserAcknowledgements = async (req, res) => {
  try {
    const records = await PolicyAcknowledgement.find({
      user: req.user._id
    }).populate("policy", "title version");

    res.json(records);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getPolicyCompliance = async (req, res) => {
  try {
    const policyId = req.params.policyId;

    const records = await PolicyAcknowledgement.find({
      policy: policyId
    }).populate("user", "name email role");

    res.json(records);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const User = require("../models/User");

const getComplianceAnalytics = async (req, res) => {
  try {
    const policyId = req.params.policyId;

    // Total employees
    const totalEmployees = await User.countDocuments({ role: "Employee" });

    // Employees who acknowledged policy
    const acknowledged = await PolicyAcknowledgement.countDocuments({
      policy: policyId
    });

    const pending = totalEmployees - acknowledged;

    const percentage =
      totalEmployees === 0
        ? 0
        : ((acknowledged / totalEmployees) * 100).toFixed(2);

    res.json({
      totalEmployees,
      acknowledged,
      pending,
      compliancePercentage: percentage + "%"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNonCompliantEmployees = async (req, res) => {
  try {
    const policyId = req.params.policyId;

    // Employees who acknowledged
    const acknowledgedRecords = await PolicyAcknowledgement.find({
      policy: policyId
    }).select("user");

    const acknowledgedUserIds = acknowledgedRecords.map(
      (record) => record.user
    );

    // Employees who did NOT acknowledge
    const nonCompliantEmployees = await User.find({
      role: "Employee",
      _id: { $nin: acknowledgedUserIds }
    }).select("name email role");

    res.json(nonCompliantEmployees);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { acknowledgePolicy, getUserAcknowledgements, getPolicyCompliance, getComplianceAnalytics, getNonCompliantEmployees};
