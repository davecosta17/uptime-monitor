const API = "http://localhost:3000/api/sites";

// Store existing elements + charts
const siteMap = new Map();

async function fetchSites() {
    const res = await fetch(API);
    const sites = await res.json();

    sites.forEach(site => {
        if (siteMap.has(site.id)) {
            updateSite(site);
        } else {
            createSite(site);
        }
    });
}

// 🆕 Create new site UI
function createSite(site) {
    const container = document.getElementById("siteList");

    const div = document.createElement("div");
    div.className = "card";
    div.id = `site-${site.id}`;

    const chartId = `chart-${site.id}`;

    div.innerHTML = `
        <h3>${site.url}</h3>

        Status: <span class="status ${site.status}" id="status-${site.id}">${site.status}</span><br/>
        Response: <span id="response-${site.id}">${formatResponse(site.responseTime)}</span><br/>
        Uptime: <span id="uptime-${site.id}">${calculateUptime(site)}%</span><br/>

        <small id="time-${site.id}">${site.lastChecked || "Never checked"}</small>

        <canvas id="${chartId}" height="100"></canvas>

        <button onclick="deleteSite(${site.id})">Delete</button>
    `;

    container.appendChild(div);

    // Create chart once
    const chart = new Chart(document.getElementById(chartId), {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Response Time (ms)",
                data: [],
                fill: false
            }]
        }
    });

    siteMap.set(site.id, { element: div, chart });

    updateSite(site);
}

// 🔄 Update existing UI (NO re-render)
function updateSite(site) {
    const { chart } = siteMap.get(site.id);

    document.getElementById(`status-${site.id}`).textContent = site.status;
    document.getElementById(`status-${site.id}`).className = `status ${site.status}`;

    document.getElementById(`response-${site.id}`).textContent = formatResponse(site.responseTime);
    document.getElementById(`uptime-${site.id}`).textContent = calculateUptime(site) + "%";
    document.getElementById(`time-${site.id}`).textContent = site.lastChecked;

    // Update chart data
    const history = site.responseHistory || [];

    chart.data.labels = history.map(h => h.time);
    chart.data.datasets[0].data = history.map(h => h.value);

    chart.update();
}

// 🧮 Helpers
function calculateUptime(site) {
    if (!site.totalChecks) return "0.00";
    return ((site.totalUp / site.totalChecks) * 100).toFixed(2);
}

function formatResponse(value) {
    return value ? value + " ms" : "N/A";
}

// ➕ Add site
async function addSite() {
    const input = document.getElementById("urlInput");
    const url = input.value.trim();

    if (!url) return;

    await fetch(API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
    });

    input.value = "";
}

// ❌ Delete site
async function deleteSite(id) {
    await fetch(`${API}/${id}`, {
        method: "DELETE"
    });

    const site = siteMap.get(id);
    if (site) {
        site.element.remove();
        siteMap.delete(id);
    }
}

// Run updates WITHOUT wiping UI
setInterval(fetchSites, 5000);
fetchSites();