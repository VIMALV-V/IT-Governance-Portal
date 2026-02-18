const express = require("express");
const {
  acknowledgePolicy,
  getUserAcknowledgements,
  getPolicyCompliance,
  getComplianceAnalytics,
  getNonCompliantEmployees
} = require("../controllers/acknowledgementController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, acknowledgePolicy);

router.get("/", protect, getUserAcknowledgements);

router.get(
  "/policy/:policyId",
  protect,
  authorizeRoles("Admin", "Manager"),
  getPolicyCompliance
);

router.get(
  "/analytics/:policyId",
  protect,
  authorizeRoles("Admin", "Manager"),
  getComplianceAnalytics
);

router.get(
  "/non-compliant/:policyId",
  protect,
  authorizeRoles("Admin", "Manager"),
  getNonCompliantEmployees
);

module.exports = router;
