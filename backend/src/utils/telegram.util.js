const axios = require("axios");
require("dotenv").config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(message) {
    if (!TOKEN || !CHAT_ID) {
        console.log("Telegram not configured");
        return;
    }

    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    try {
        await axios.post(url, {
            chat_id: CHAT_ID,
            text: message
        });
    } catch (err) {
        console.error("Telegram error:", err.message);
    }
}

module.exports = { sendTelegramMessage };