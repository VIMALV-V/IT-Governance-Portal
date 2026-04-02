const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./CONFIG/db");
const { ensureDefaultRoles } = require("./services/rbacService");
const { autoAuditLogger } = require("./middleware/auditMiddleware");

const authRoutes = require("./routes/authRoutes");
const policyRoutes = require("./routes/policyRoutes");
const acknowledgementRoutes = require("./routes/acknowledgementRoutes");
const auditRoutes = require("./routes/auditRoutes");
const requestRoutes = require("./routes/requestRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const riskRoutes = require("./routes/riskRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const searchRoutes = require("./routes/searchRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { protect, authorizeRoles } = require("./middleware/authMiddleware");

const app = express();

connectDB().then(() => {
  ensureDefaultRoles().catch((error) => {
    console.error("Failed to ensure default roles:", error.message);
  });
});

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(autoAuditLogger);

app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/acknowledgements", acknowledgementRoutes);
app.use("/api/auditlogs", auditRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/risks", riskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "it-governance-portal-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("IT Governance Portal Backend is running");
});

app.get("/api/admin/ping", protect, authorizeRoles("Admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

app.get("/api/manager", protect, authorizeRoles("Admin", "Manager"), (req, res) => {
  res.json({ message: "Manager access granted" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
