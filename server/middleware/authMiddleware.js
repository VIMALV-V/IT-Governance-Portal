const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

const collectPermissions = (roles = []) => {
  const set = new Set();
  for (const role of roles) {
    for (const permission of role.permissions || []) {
      set.add(permission);
    }
  }
  return [...set];
};

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password").populate("roles", "name permissions");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    let populatedRoles = user.roles || [];
    if (populatedRoles.length === 0 && user.role) {
      const legacyRole = await Role.findOne({ name: user.role }).select("name permissions");
      if (legacyRole) {
        populatedRoles = [legacyRole];
      }
    }

    const roleNames = populatedRoles.map((role) => role.name);
    if (roleNames.length === 0 && user.role) {
      roleNames.push(user.role);
    }

    req.user = user;
    req.auth = {
      roleNames,
      permissions: collectPermissions(populatedRoles),
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const currentRoles = req.auth?.roleNames || [req.user?.role].filter(Boolean);
    const allowed = currentRoles.some((role) => roles.includes(role));
    if (!allowed) {
      return res.status(403).json({ message: "Access denied: insufficient role" });
    }
    return next();
  };
};

const authorizePermissions = (...permissions) => {
  return (req, res, next) => {
    const currentPermissions = req.auth?.permissions || [];
    const missing = permissions.filter((permission) => !currentPermissions.includes(permission));

    if (missing.length > 0) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions",
        missing,
      });
    }

    return next();
  };
};

module.exports = { protect, authorizeRoles, authorizePermissions };
