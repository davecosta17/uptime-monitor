require("dotenv").config();

module.exports = {
    port: process.env.PORT || 3000,
    interval: parseInt(process.env.CHECK_INTERVAL) || 30000,
    timeout: parseInt(process.env.TIMEOUT) || 5000
};