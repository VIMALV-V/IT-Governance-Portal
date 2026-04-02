const express = require("express");
const {
  submitRequest,
  getUserRequests,
  getAllRequests,
  reviewRequest,
} = require("../controllers/requestController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Employee submits request
router.post("/", protect, submitRequest);

// Employee views own requests
router.get("/my", protect, getUserRequests);

// Manager/Admin view all requests
router.get("/", protect, authorizeRoles("Admin", "Manager"), getAllRequests);

// Manager/Admin approve/reject request
router.put("/:id", protect, authorizeRoles("Admin", "Manager"), reviewRequest);

module.exports = router;