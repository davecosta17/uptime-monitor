const express = require("express");
const cors = require("cors");
const siteRoutes = require("./routes/sites.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/sites", siteRoutes);

module.exports = app; // ✅ MUST export the app