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

        try {
            const res = await axios.get(site.url, {
                timeout: config.timeout
            });

            if (res.status === 200) {
                newStatus = "UP";
            }
        } catch (err) {
            newStatus = "DOWN";
        }

        // 🚨 Only send alert if status changed
        if (site.status && site.status !== newStatus) {
            let message = "";

            if (newStatus === "DOWN") {
                message = `🚨 ALERT: ${site.url} is DOWN`;
            } else {
                message = `✅ RECOVERED: ${site.url} is back UP`;
            }

            console.log(message);
            await sendTelegramMessage(message);
        }

        // Update site data
        site.status = newStatus;
        site.lastChecked = new Date().toISOString();
    }

    writeJSON(filePath, sites);
}

function startMonitoring() {
    console.log("🔄 Monitoring started...");

    // Run immediately
    checkSites();

    // Then repeat
    setInterval(checkSites, config.interval);
}

module.exports = { startMonitoring };