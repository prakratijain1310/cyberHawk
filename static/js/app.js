const API_BASE = "/api";
const app = document.getElementById("app");
const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");

/* ---------------- API HELPERS ---------------- */
async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  return res.json();
}
async function apiPost(path, data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
  return res.json();
}

/* ---------------- NAV ---------------- */
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => navigate(link.dataset.page));
});

function setActiveNav(page) {
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  const el = document.querySelector(`.nav-link[data-page="${page}"]`);
  if (el) el.classList.add("active");
}

function navigate(page) {
  setActiveNav(page);
  if (page === "dashboard") return renderDashboard();
  if (page === "alerts") return renderAlerts();
  if (page === "search") return renderSearch();
}

/* ---------------- MODAL ---------------- */
function openModal(html) {
  modalContent.innerHTML = html;
  modalOverlay.classList.add("active");
}
function closeModal() {
  modalOverlay.classList.remove("active");
  modalContent.innerHTML = "";
}
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });

/* ---------------- BADGES ---------------- */
function severityBadge(sev) {
  const cls = { Critical: "badge-critical", High: "badge-high", Medium: "badge-medium", Low: "badge-low" }[sev] || "badge-low";
  return `<span class="badge ${cls}">${sev}</span>`;
}
function statusBadge(status) {
  return `<span class="badge ${status === 'Open' ? 'badge-open' : 'badge-resolved'}">${status}</span>`;
}

/* ---------------- DASHBOARD ---------------- */
async function renderDashboard() {
  const stats = await apiGet("/dashboard/stats");
  app.innerHTML = `
    <div class="topbar"><div><h1>Dashboard</h1><p>Overview of security alert activity</p></div></div>
    <div class="grid-cards">
      <div class="stat-card"><div class="value">${stats.total_alerts}</div><div class="label">Total Alerts</div></div>
      <div class="stat-card"><div class="value">${stats.critical}</div><div class="label">Critical</div></div>
      <div class="stat-card"><div class="value">${stats.high}</div><div class="label">High</div></div>
      <div class="stat-card"><div class="value">${stats.medium}</div><div class="label">Medium</div></div>
      <div class="stat-card"><div class="value">${stats.low}</div><div class="label">Low</div></div>
      <div class="stat-card"><div class="value">${stats.open}</div><div class="label">Open</div></div>
      <div class="stat-card"><div class="value">${stats.resolved}</div><div class="label">Resolved</div></div>
    </div>
    <div class="card">
      <div class="section-title">Recent Alerts</div>
      <div id="recentAlerts">Loading...</div>
    </div>
  `;
  const alerts = await apiGet("/alerts");
  const recent = alerts.slice(0, 5);
  document.getElementById("recentAlerts").innerHTML = recent.length ? `
    <table>
      <thead><tr><th>Title</th><th>Type</th><th>Severity</th><th>Status</th><th>Detected</th></tr></thead>
      <tbody>
        ${recent.map(a => `
          <tr onclick="viewAlert('${a.id}')">
            <td>${a.title}</td><td>${a.alert_type}</td><td>${severityBadge(a.severity)}</td>
            <td>${statusBadge(a.status)}</td><td>${a.detected_at}</td>
          </tr>`).join("")}
      </tbody>
    </table>` : `<div class="empty-state">No alerts yet</div>`;
}

/* ---------------- ALERT LIST ---------------- */
async function renderAlerts() {
  app.innerHTML = `
    <div class="topbar">
      <div><h1>Alert List</h1><p>All detected security alerts</p></div>
      <button class="btn" onclick="openAlertForm()">+ Add Alert</button>
    </div>
    <div class="card"><div id="alertsTable">Loading...</div></div>
  `;
  const alerts = await apiGet("/alerts");
  renderAlertsTable(alerts, "alertsTable");
}

function renderAlertsTable(alerts, containerId) {
  document.getElementById(containerId).innerHTML = alerts.length ? `
    <table>
      <thead><tr><th>Title</th><th>Type</th><th>Severity</th><th>Source IP</th><th>Status</th><th>Detected</th><th></th></tr></thead>
      <tbody>
        ${alerts.map(a => `
          <tr>
            <td onclick="viewAlert('${a.id}')">${a.title}</td>
            <td onclick="viewAlert('${a.id}')">${a.alert_type}</td>
            <td onclick="viewAlert('${a.id}')">${severityBadge(a.severity)}</td>
            <td onclick="viewAlert('${a.id}')">${a.source_ip || "-"}</td>
            <td onclick="viewAlert('${a.id}')">${statusBadge(a.status)}</td>
            <td onclick="viewAlert('${a.id}')">${a.detected_at}</td>
            <td><button class="btn btn-danger" onclick="event.stopPropagation(); removeAlert('${a.id}')">Delete</button></td>
          </tr>`).join("")}
      </tbody>
    </table>` : `<div class="empty-state">No alerts found</div>`;
}

/* ---------------- ADD ALERT ---------------- */
function openAlertForm() {
  openModal(`
    <h2>Add New Alert</h2>
    <div class="form-group"><label>Title</label><input id="a_title" placeholder="e.g. Multiple Failed Login Attempts"></div>
    <div class="form-group"><label>Alert Type</label><input id="a_type" placeholder="e.g. Brute Force, Malware, Phishing"></div>
    <div class="form-group"><label>Severity</label>
      <select id="a_severity"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select>
    </div>
    <div class="form-group"><label>Source IP</label><input id="a_source_ip" placeholder="e.g. 192.168.1.45"></div>
    <div class="form-group"><label>Target System</label><input id="a_target" placeholder="e.g. Auth Server"></div>
    <div class="form-group"><label>Status</label>
      <select id="a_status"><option>Open</option><option>Resolved</option></select>
    </div>
    <div class="form-group"><label>Description</label><textarea id="a_description"></textarea></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn" onclick="submitAlert()">Save Alert</button>
    </div>
  `);
}

async function submitAlert() {
  const data = {
    title: document.getElementById("a_title").value,
    alert_type: document.getElementById("a_type").value,
    severity: document.getElementById("a_severity").value,
    source_ip: document.getElementById("a_source_ip").value,
    target_system: document.getElementById("a_target").value,
    status: document.getElementById("a_status").value,
    description: document.getElementById("a_description").value,
  };
  if (!data.title) { alert("Title is required"); return; }
  await apiPost("/alerts", data);
  closeModal();
  renderAlerts();
}

/* ---------------- ALERT DETAILS ---------------- */
async function viewAlert(id) {
  const a = await apiGet(`/alerts/${id}`);
  openModal(`
    <h2>${a.title}</h2>
    <p><b>Type:</b> ${a.alert_type}</p>
    <p><b>Severity:</b> ${severityBadge(a.severity)}</p>
    <p><b>Status:</b> ${statusBadge(a.status)}</p>
    <p><b>Source IP:</b> ${a.source_ip || "-"}</p>
    <p><b>Target System:</b> ${a.target_system || "-"}</p>
    <p><b>Detected At:</b> ${a.detected_at}</p>
    <p style="margin-top:10px;"><b>Description:</b><br>${a.description || "-"}</p>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
      <button class="btn btn-danger" onclick="removeAlert('${a.id}', true)">Delete</button>
    </div>
  `);
}

/* ---------------- DELETE ---------------- */
async function removeAlert(id, fromModal) {
  if (!confirm("Delete this alert? This cannot be undone.")) return;
  await apiDelete(`/alerts/${id}`);
  if (fromModal) closeModal();
  const activePage = document.querySelector(".nav-link.active");
  navigate(activePage ? activePage.dataset.page : "alerts");
}

/* ---------------- SEARCH ---------------- */
function renderSearch() {
  app.innerHTML = `
    <div class="topbar"><div><h1>Search Alerts</h1><p>Search across all detected alerts</p></div></div>
    <div class="search-bar">
      <input id="searchInput" placeholder="Search by title, type, severity, or IP...">
      <button class="btn" onclick="doSearch()">Search</button>
    </div>
    <div class="card"><div id="searchResults"><div class="empty-state">Enter a keyword to search alerts</div></div></div>
  `;
  document.getElementById("searchInput").addEventListener("keydown", e => {
    if (e.key === "Enter") doSearch();
  });
}

async function doSearch() {
  const q = document.getElementById("searchInput").value;
  const results = await apiGet(`/alerts/search?q=${encodeURIComponent(q)}`);
  renderAlertsTable(results, "searchResults");
  if (!results.length) {
    document.getElementById("searchResults").innerHTML = `<div class="empty-state">No matching alerts found</div>`;
  }
}

/* ---------------- INIT ---------------- */
navigate("dashboard");
