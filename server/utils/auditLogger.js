const AuditLog = require("../models/AuditLog");

const getClientIp = (req) => {
  const fwd = req?.headers?.["x-forwarded-for"];
  if (fwd && typeof fwd === "string") {
    return fwd.split(",")[0].trim();
  }
  return req?.ip || req?.socket?.remoteAddress || "unknown";
};

const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const logAudit = async (...args) => {
  try {
    let payload;

    if (typeof args[0] === "object" && args[0] !== null && !Array.isArray(args[0])) {
      payload = args[0];
    } else {
      payload = {
        user: args[0],
        action: args[1],
        module: args[2] || "General",
        previousValue: args[3]?.previousValue ?? null,
        newValue: args[3]?.newValue ?? null,
      };
    }

    const req = payload.req;
    if (req) {
      req.__auditLogged = true;
    }

    await AuditLog.create({
      user: payload.user || req?.user?._id || null,
      username: payload.username || req?.user?.name || "System",
      roles: toArray(payload.roles || req?.auth?.roleNames),
      action: payload.action,
      module: payload.module || "General",
      source: payload.source || "manual",
      ipAddress: payload.ipAddress || getClientIp(req),
      userAgent: payload.userAgent || req?.headers?.["user-agent"] || "",
      previousValue: payload.previousValue ?? null,
      newValue: payload.newValue ?? null,
      targetUser: payload.targetUser || null,
      status: payload.status || "success",
      severity: payload.severity || "low",
    });
  } catch (error) {
    console.error("Audit logging failed:", error.message);
  }
};

module.exports = logAudit;
