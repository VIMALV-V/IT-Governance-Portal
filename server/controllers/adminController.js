const User = require("../models/User");
const Role = require("../models/Role");
const AuditLog = require("../models/AuditLog");
const logAudit = require("../utils/auditLogger");
const { ALL_PERMISSIONS } = require("../constants/permissions");
const PDFDocument = require("pdfkit");

const normalizePermissionList = (permissions = []) => {
  return [...new Set((permissions || []).filter((permission) => ALL_PERMISSIONS.includes(permission)))];
};

const buildAuditFilters = ({ userId, action, module, source, dateFrom, dateTo }) => {
  const filters = {};
  if (userId) filters.user = userId;
  if (action) filters.action = { $regex: action, $options: "i" };
  if (module) filters.module = { $regex: module, $options: "i" };
  if (source) filters.source = source;
  if (dateFrom || dateTo) {
    filters.createdAt = {};
    if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filters.createdAt.$lte = new Date(dateTo);
  }
  return filters;
};

const getUsers = async (req, res) => {
  try {
    const { q = "", role = "", status = "", page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const match = {};
    if (q) {
      match.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }
    if (status === "active") match.isActive = true;
    if (status === "inactive") match.isActive = false;

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "roles",
          localField: "roles",
          foreignField: "_id",
          as: "roleDocs",
        },
      },
      {
        $addFields: {
          roleNames: {
            $cond: [
              { $gt: [{ $size: "$roleDocs" }, 0] },
              "$roleDocs.name",
              {
                $cond: [{ $ifNull: ["$role", false] }, ["$role"], []],
              },
            ],
          },
        },
      },
    ];

    if (role) {
      pipeline.push({ $match: { roleNames: role } });
    }

    pipeline.push(
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limitNum },
            { $project: { password: 0, __v: 0 } },
          ],
          meta: [{ $count: "total" }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $ifNull: [{ $arrayElemAt: ["$meta.total", 0] }, 0] },
        },
      }
    );

    const [result] = await User.aggregate(pipeline);

    return res.json({
      data: result?.data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result?.total || 0,
        pages: Math.max(1, Math.ceil((result?.total || 0) / limitNum)),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUserAccess = async (req, res) => {
  try {
    const { roleIds, isActive } = req.body;
    const user = await User.findById(req.params.id).populate("roles", "name permissions");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousValue = {
      roles: (user.roles || []).map((r) => r.name),
      isActive: user.isActive,
    };

    if (Array.isArray(roleIds)) {
      const roles = await Role.find({ _id: { $in: roleIds } });
      user.roles = roles.map((role) => role._id);
      user.role = roles[0]?.name || user.role;
    }

    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }

    await user.save();
    const updated = await User.findById(user._id).populate("roles", "name permissions").select("-password");

    await logAudit({
      req,
      user: req.user._id,
      username: req.user.name,
      roles: req.auth.roleNames,
      action: "Updated User Access",
      module: "Admin/User Management",
      source: "manual",
      targetUser: updated._id,
      previousValue,
      newValue: {
        roles: (updated.roles || []).map((r) => r.name),
        isActive: updated.isActive,
      },
      severity: "medium",
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ isSystem: -1, name: 1 });
    return res.json(roles);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, description = "", permissions = [] } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Role name is required" });
    }

    const exists = await Role.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const role = await Role.create({
      name: name.trim(),
      description: description.trim(),
      permissions: normalizePermissionList(permissions),
      isSystem: false,
    });

    await logAudit({
      req,
      user: req.user._id,
      username: req.user.name,
      roles: req.auth.roleNames,
      action: "Created Role",
      module: "Admin/Role Management",
      source: "manual",
      newValue: role,
      severity: "high",
    });

    return res.status(201).json(role);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    const previousValue = {
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    };

    role.name = req.body.name?.trim() || role.name;
    role.description = req.body.description?.trim() || role.description;
    if (Array.isArray(req.body.permissions)) {
      role.permissions = normalizePermissionList(req.body.permissions);
    }

    await role.save();

    await logAudit({
      req,
      user: req.user._id,
      username: req.user.name,
      roles: req.auth.roleNames,
      action: "Updated Role",
      module: "Admin/Role Management",
      source: "manual",
      previousValue,
      newValue: role,
      severity: "high",
    });

    return res.json(role);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    if (role.isSystem) {
      return res.status(400).json({ message: "System roles cannot be deleted" });
    }

    const assignedUsers = await User.countDocuments({ roles: role._id });
    if (assignedUsers > 0) {
      return res.status(400).json({ message: "Role is assigned to users and cannot be deleted" });
    }

    await role.deleteOne();

    await logAudit({
      req,
      user: req.user._id,
      username: req.user.name,
      roles: req.auth.roleNames,
      action: "Deleted Role",
      module: "Admin/Role Management",
      source: "manual",
      previousValue: role,
      severity: "critical",
    });

    return res.json({ message: "Role deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const filters = buildAuditFilters(req.query);

    const [logs, total] = await Promise.all([
      AuditLog.find(filters)
        .populate("user", "name email")
        .populate("targetUser", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(filters),
    ]);

    return res.json({
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const exportAuditLogsCsv = async (req, res) => {
  try {
    const filters = buildAuditFilters(req.query);
    const logs = await AuditLog.find(filters)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(2000);

    const header = ["timestamp", "user", "roles", "source", "action", "module", "ipAddress", "status", "severity"];

    const rows = logs.map((log) => [
      new Date(log.createdAt).toISOString(),
      log.user?.email || log.username || "System",
      (log.roles || []).join("|"),
      log.source || "manual",
      log.action,
      log.module,
      log.ipAddress,
      log.status,
      log.severity,
    ]);

    const escapeCell = (cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((line) => line.map(escapeCell).join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="audit-logs-${Date.now()}.csv"`);

    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const exportAuditLogsPdf = async (req, res) => {
  try {
    const filters = buildAuditFilters(req.query);
    const logs = await AuditLog.find(filters)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(2000);

    const fileName = `audit-logs-${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
    doc.pipe(res);

    doc.fontSize(16).text("Audit Logs Report", { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(9).text(`Generated: ${new Date().toISOString()}`);
    doc.moveDown(1);

    const headers = ["Time", "User", "Roles", "Source", "Action", "Module", "IP", "Status"];
    const widths = [95, 110, 90, 55, 130, 95, 100, 60];

    const drawRow = (values, isHeader = false) => {
      const y = doc.y;
      let x = doc.page.margins.left;
      values.forEach((value, index) => {
        doc
          .font(isHeader ? "Helvetica-Bold" : "Helvetica")
          .fontSize(8)
          .text(String(value || "-"), x, y, {
            width: widths[index],
            continued: false,
          });
        x += widths[index];
      });
      doc.moveDown(0.9);

      if (doc.y > doc.page.height - 60) {
        doc.addPage();
      }
    };

    drawRow(headers, true);
    doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).strokeColor("#cccccc").stroke();
    doc.moveDown(0.3);

    logs.forEach((log) => {
      drawRow([
        new Date(log.createdAt).toLocaleString(),
        log.user?.email || log.username || "System",
        (log.roles || []).join("|") || "-",
        log.source || "manual",
        log.action,
        log.module,
        log.ipAddress,
        log.status,
      ]);
    });

    doc.end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  updateUserAccess,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getAuditLogs,
  exportAuditLogsCsv,
  exportAuditLogsPdf,
};
