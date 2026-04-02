const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logAudit = require("../utils/auditLogger");

const getPermissions = (roles = []) => {
  const set = new Set();
  roles.forEach((role) => (role.permissions || []).forEach((permission) => set.add(permission)));
  return [...set];
};

const getRoleNames = (roles = [], fallbackRole = "Employee") => {
  const names = roles.map((role) => role.name);
  if (names.length === 0) {
    names.push(fallbackRole);
  }
  return names;
};

const getDefaultRole = async () => {
  let employeeRole = await Role.findOne({ name: "Employee" });
  if (!employeeRole) {
    employeeRole = await Role.create({
      name: "Employee",
      description: "Standard end-user access",
      permissions: ["view_data"],
      isSystem: true,
    });
  }
  return employeeRole;
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const employeeRole = await getDefaultRole();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: employeeRole.name,
      roles: [employeeRole._id],
    });

    await logAudit({
      req,
      user: user._id,
      username: user.name,
      roles: [employeeRole.name],
      action: "User Registered",
      module: "Authentication",
      newValue: { email: user.email, role: employeeRole.name },
      severity: "medium",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail }).populate("roles", "name permissions");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is inactive. Contact administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAudit({
        req,
        user: user._id,
        username: user.name,
        roles: getRoleNames(user.roles, user.role),
        action: "Login Failed",
        module: "Authentication",
        status: "failed",
        severity: "high",
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    let resolvedRoles = user.roles || [];
    if (resolvedRoles.length === 0 && user.role) {
      const legacyRole = await Role.findOne({ name: user.role }).select("name permissions");
      if (legacyRole) {
        resolvedRoles = [legacyRole];
      }
    }

    const roleNames = getRoleNames(resolvedRoles, user.role);
    const token = jwt.sign({ id: user._id, roles: roleNames }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    await logAudit({
      req,
      user: user._id,
      username: user.name,
      roles: roleNames,
      action: "User Login",
      module: "Authentication",
      severity: "low",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleNames[0],
        roles: roleNames,
        permissions: getPermissions(resolvedRoles),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  await logAudit({
    req,
    user: req.user._id,
    username: req.user.name,
    roles: req.auth.roleNames,
    action: "User Logout",
    module: "Authentication",
    severity: "low",
  });
  return res.json({ message: "Logout recorded" });
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousValue = {
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
    };

    user.name = req.body.name?.trim() || user.name;
    user.email = req.body.email?.trim().toLowerCase() || user.email;
    if (req.body.profilePicture !== undefined) {
      user.profilePicture = req.body.profilePicture;
    }

    const updatedUser = await user.save();

    await logAudit({
      req,
      user: req.user._id,
      username: req.user.name,
      roles: req.auth.roleNames,
      action: "Updated Profile",
      module: "Profile",
      previousValue,
      newValue: {
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
      },
      severity: "low",
    });

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await logAudit({
      req,
      user: req.user._id,
      username: req.user.name,
      roles: req.auth.roleNames,
      action: "Updated Password",
      module: "Profile",
      severity: "medium",
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("roles", "name permissions");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      ...user.toObject(),
      permissions: getPermissions(user.roles || []),
      roleNames: getRoleNames(user.roles || [], user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, logoutUser, updateProfile, updatePassword, getProfile };
