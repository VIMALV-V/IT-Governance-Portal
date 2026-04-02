const express = require("express");
const { getUsers, updateUserRole, updateUserStatus } = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .get(protect, authorizeRoles("Admin"), getUsers);

router.route("/:id/role")
  .put(protect, authorizeRoles("Admin"), updateUserRole);

router.route("/:id/status")
  .put(protect, authorizeRoles("Admin"), updateUserStatus);

module.exports = router;
