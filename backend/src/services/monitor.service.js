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
            responseTime = null;
            newStatus = "DOWN";
        }

        // 🚨 Alert only on status change
        if (site.status && site.status !== newStatus) {
            let message = "";

            if (newStatus === "DOWN") {
                message = `🚨 ALERT: ${site.url} is DOWN`;
            } else {
                message = `✅ RECOVERED: ${site.url} is back UP (${responseTime} ms)`;
            }

            console.log(message);
            await sendTelegramMessage(message);
        }

        // Save updates
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