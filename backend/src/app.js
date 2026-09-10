const express = require("express");
const cors = require("cors");

const repoRoutes = require("./routes/repoRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("CodeLens AI Backend Running 🚀");
});

// API Routes
app.use("/api/repo", repoRoutes);
app.use("/api/settings", settingsRoutes);

module.exports = app;