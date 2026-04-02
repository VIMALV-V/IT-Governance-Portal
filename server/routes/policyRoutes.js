const express = require("express");
const {
  createPolicy,
  getPolicies,
  updatePolicy,
  deletePolicy,
} = require("../controllers/policyController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin & Manager can create policy
router.post("/", protect, authorizeRoles("Admin", "Manager"), createPolicy);

// All authenticated users can view policies
router.get("/", protect, getPolicies);

// Update policy (Admin / Manager)
router.put("/:id", protect, authorizeRoles("Admin", "Manager"), updatePolicy);

// Delete policy (Admin only)
router.delete("/:id", protect, authorizeRoles("Admin"), deletePolicy);

module.exports = router;