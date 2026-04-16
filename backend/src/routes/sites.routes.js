const express = require("express");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/file.util");

const router = express.Router();

const filePath = path.join(__dirname, "../data/sites.json");

// GET all sites
router.get("/", (req, res) => {
    const sites = readJSON(filePath);
    res.json(sites);
});

// ADD new site
router.post("/", (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    const sites = readJSON(filePath);

    const newSite = {
        id: Date.now(),
        url,
        status: "unknown",
        lastChecked: null
    };

    sites.push(newSite);
    writeJSON(filePath, sites);

    res.status(201).json(newSite);
});

// DELETE a site
router.delete("/:id", (req, res) => {
    const id = parseInt(req.params.id);

    let sites = readJSON(filePath);

    const filteredSites = sites.filter(site => site.id !== id);

    if (sites.length === filteredSites.length) {
        return res.status(404).json({ error: "Site not found" });
    }

    writeJSON(filePath, filteredSites);

    res.json({ message: "Site removed successfully" });
});

module.exports = router;