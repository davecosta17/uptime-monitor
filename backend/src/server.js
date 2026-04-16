const app = require("./app");
const config = require("./config");
const { startMonitoring } = require("./services/monitor.service");

// Start server
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

// Start background monitoring
startMonitoring();