const express = require("express");
const {
  createRisk,
  getRisks,
  updateRiskStatus
} = require("../controllers/riskController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin & Manager create risk
router.post("/", protect, authorizeRoles("Admin", "Manager"), createRisk);

// All authenticated users can view risks
router.get("/", protect, getRisks);

// Admin & Manager update risk status
router.put("/:id", protect, authorizeRoles("Admin", "Manager"), updateRiskStatus);

module.exports = router;
