const axios = require("axios");
const path = require("path");

const { readJSON, writeJSON } = require("../utils/file.util");
const { sendTelegramMessage } = require("../utils/telegram.util");
const config = require("../config");

const filePath = path.join(__dirname, "../data/sites.json");

async function checkSites() {
    const sites = readJSON(filePath);

    for (let site of sites) {
        let newStatus = "DOWN";
        let responseTime = null;

        const start = Date.now();

        try {
            const res = await axios.get(site.url, {
                timeout: config.timeout
            });

            responseTime = Date.now() - start;

            if (res.status === 200) {
                newStatus = "UP";
            }
        } catch (err) {
            newStatus = "DOWN";
            responseTime = null;
        }

        // Initialize fields
        site.totalChecks = site.totalChecks || 0;
        site.totalUp = site.totalUp || 0;
        site.history = site.history || [];
        site.responseHistory = site.responseHistory || [];

        // Update counters
        site.totalChecks += 1;
        if (newStatus === "UP") {
            site.totalUp += 1;
        }

        // 📊 Save response time history
        site.responseHistory.push({
            time: new Date().toLocaleTimeString(),
            value: responseTime
        });

        // Keep only last 20 points
        if (site.responseHistory.length > 20) {
            site.responseHistory.shift();
        }

        // 🚨 Status change
        if (site.status && site.status !== newStatus) {
            site.history.push({
                status: newStatus,
                timestamp: new Date().toISOString()
            });

            if (site.history.length > 50) {
                site.history.shift();
            }

            let message = "";

            if (newStatus === "DOWN") {
                message = `🚨 ALERT: ${site.url} is DOWN`;
            } else {
                message = `✅ RECOVERED: ${site.url} is back UP (${responseTime} ms)`;
            }

            await sendTelegramMessage(message);
        }

        site.status = newStatus;
        site.responseTime = responseTime;
        site.lastChecked = new Date().toISOString();
    }

    writeJSON(filePath, sites);
}

function startMonitoring() {
    console.log("🔄 Monitoring started...");

    checkSites();
    setInterval(checkSites, config.interval);
}

module.exports = { startMonitoring };