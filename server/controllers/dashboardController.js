const Policy = require("../models/Policy");
const Request = require("../models/Request");
const User = require("../models/User");
const PolicyAcknowledgement = require("../models/PolicyAcknowledgement");

const getDashboardStats = async (req, res) => {
  try {

    const totalPolicies = await Policy.countDocuments();

    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: "Pending" });
    const approvedRequests = await Request.countDocuments({ status: "Approved" });
    const rejectedRequests = await Request.countDocuments({ status: "Rejected" });

    const totalEmployees = await User.countDocuments({ role: "Employee" });
    const totalAcknowledgements = await PolicyAcknowledgement.countDocuments();

    const compliancePercentage =
      totalEmployees === 0
        ? 0
        : ((totalAcknowledgements / totalEmployees) * 100).toFixed(2);

    res.json({
      totalPolicies,
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalEmployees,
      totalAcknowledgements,
      compliancePercentage: compliancePercentage + "%"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
