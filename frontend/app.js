const API = "http://localhost:3000/api/sites";

async function fetchSites() {
    const res = await fetch(API);
    const sites = await res.json();

    const list = document.getElementById("siteList");
    list.innerHTML = "";

    sites.forEach(site => {
        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${site.url}</strong>
            <br/>
            Status: <span class="status ${site.status}">${site.status}</span>
            <br/>
            Response: ${site.responseTime ? site.responseTime + " ms" : "N/A"}
            <br/>
            <small>${site.lastChecked || "Never checked"}</small>
            <br/><br/>
            <button onclick="deleteSite(${site.id})">Delete</button>
        `;

        list.appendChild(li);
    });
}

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
    fetchSites();
}

async function deleteSite(id) {
    await fetch(`${API}/${id}`, {
        method: "DELETE"
    });

    fetchSites();
}

setInterval(fetchSites, 5000);
fetchSites();