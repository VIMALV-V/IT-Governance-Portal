const logAudit = require("../utils/auditLogger");

const SENSITIVE_FIELDS = new Set(["password", "currentPassword", "newPassword", "token"]);

const sanitizeBody = (body) => {
  if (!body || typeof body !== "object") return null;
  const output = Array.isArray(body) ? [] : {};

  Object.keys(body).forEach((key) => {
    if (SENSITIVE_FIELDS.has(key)) {
      output[key] = "[REDACTED]";
      return;
    }

    const value = body[key];
    if (value && typeof value === "object") {
      output[key] = sanitizeBody(value);
    } else {
      output[key] = value;
    }
  });

  return output;
};

const deriveModule = (path = "") => {
  const clean = path.replace(/^\/api\/?/, "");
  const first = clean.split("/")[0] || "general";
  return first.charAt(0).toUpperCase() + first.slice(1);
};

const autoAuditLogger = (req, res, next) => {
  const method = req.method.toUpperCase();
  const shouldTrack = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (!shouldTrack) {
    return next();
  }

  const startedAt = Date.now();

  res.on("finish", async () => {
    try {
      if (req.__auditLogged) {
        return;
      }

      if (!req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/api/health")) {
        return;
      }

      const status = res.statusCode >= 400 ? "failed" : "success";
      const severity =
        res.statusCode >= 500 ? "high" :
        res.statusCode >= 400 ? "medium" :
        method === "DELETE" ? "medium" : "low";

      await logAudit({
        req,
        user: req.user?._id || null,
        username: req.user?.name || "Anonymous",
        roles: req.auth?.roleNames || [],
        action: `${method} ${req.baseUrl || ""}${req.route?.path || req.path}`,
        module: deriveModule(req.originalUrl),
        source: "auto",
        newValue: {
          body: sanitizeBody(req.body),
          query: req.query,
          durationMs: Date.now() - startedAt,
        },
        status,
        severity,
      });
    } catch (error) {
      console.error("Auto audit logger failed:", error.message);
    }
  });

  return next();
};

module.exports = { autoAuditLogger };
