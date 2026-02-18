const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const connectDB = require("./config/db");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("IT Governance Portal Backend is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



const { protect, authorizeRoles } = require("./middleware/authMiddleware");

// Admin only route
app.get(
  "/api/admin",
  protect,
  authorizeRoles("Admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

// Manager + Admin route
app.get(
  "/api/manager",
  protect,
  authorizeRoles("Admin", "Manager"),
  (req, res) => {
    res.json({ message: "Manager access granted" });
  }
);

const policyRoutes = require("./routes/policyRoutes");

app.use("/api/policies", policyRoutes);

const acknowledgementRoutes = require("./routes/acknowledgementRoutes");

app.use("/api/acknowledgements", acknowledgementRoutes);


const auditRoutes = require("./routes/auditRoutes");

app.use("/api/auditlogs", auditRoutes);


const requestRoutes = require("./routes/requestRoutes");

app.use("/api/requests", requestRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/api/dashboard", dashboardRoutes);


const riskRoutes = require("./routes/riskRoutes");
app.use("/api/risks", riskRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

