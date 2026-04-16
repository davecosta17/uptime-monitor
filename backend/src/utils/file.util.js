const fs = require("fs");

function readJSON(path) {
    try {
        const data = fs.readFileSync(path);
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function writeJSON(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports = { readJSON, writeJSON };