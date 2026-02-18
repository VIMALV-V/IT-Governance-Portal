const express = require("express");
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin & Manager dashboard
router.get(
  "/stats",
  protect,
  authorizeRoles("Admin", "Manager"),
  getDashboardStats
);

module.exports = router;
