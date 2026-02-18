const express = require("express");
const { createPolicy, getPolicies } = require("../controllers/policyController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin & Manager can create policy
router.post("/", protect, authorizeRoles("Admin", "Manager"), createPolicy);

// All authenticated users can view policies
router.get("/", protect, getPolicies);

module.exports = router;

const { updatePolicy, deletePolicy } = require("../controllers/policyController");

// Update policy (Admin / Manager)
router.put("/:id", protect, authorizeRoles("Admin", "Manager"), updatePolicy);

// Delete policy (Admin only)
router.delete("/:id", protect, authorizeRoles("Admin"), deletePolicy);
