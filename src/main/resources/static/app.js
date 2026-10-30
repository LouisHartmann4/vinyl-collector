// ---------- Anmeldung ----------
// Jede schreibende Anfrage schickt das CSRF-Token aus dem Cookie mit; läuft die Sitzung ab,
// geht es zurück zur Anmeldung.
const nativeFetch = window.fetch.bind(window);

function csrfToken() {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

window.fetch = async (input, init = {}) => {
  const method = (init.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    init = { ...init, headers: { ...(init.headers || {}), "X-XSRF-TOKEN": csrfToken() } };
  }
  const res = await nativeFetch(input, init);
  if (res.status === 401) {
    location.replace("/login.html");
  }
  return res;
};

// Gezeichnete Platte als Platzhalter, wenn kein Cover vorhanden ist
const DISC_PLACEHOLDER = `<span class="disc" aria-hidden="true"></span>`;

// Platzhalter-Kacheln, solange die Platten einer Sammlung geladen werden
const RECORD_SKELETONS = `<div class="rec-skeleton" aria-hidden="true"><div class="cover"></div><span class="sk-line"></span><span class="sk-line short"></span></div>`.repeat(6);

const form = document.getElementById("record-form");
const formCard = document.getElementById("form-card");
const formToggle = document.getElementById("add-record-btn");
const idField = document.getElementById("record-id");
const barcodeField = document.getElementById("barcode");
const discogsReleaseIdField = document.getElementById("discogs-release-id");
const artistField = document.getElementById("artist");
const titleField = document.getElementById("title");
const genreField = document.getElementById("genre");
const releaseYearField = document.getElementById("releaseYear");
const formatField = document.getElementById("format");
const conditionField = document.getElementById("condition");
const notesField = document.getElementById("notes");
const stylesField = document.getElementById("styles");
const countryField = document.getElementById("country");
const labelField = document.getElementById("label");
const catalogNumberField = document.getElementById("catalogNumber");
const coverImageUrlField = document.getElementById("coverImageUrl");
const tracklistField = document.getElementById("tracklist");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const recordsGrid = document.getElementById("records-grid");
const emptyState = document.getElementById("empty-state");
const searchField = document.getElementById("search");
const filterToggleBtn = document.getElementById("filter-toggle-btn");
const filterPanel = document.getElementById("filter-panel");
const filterGenre = document.getElementById("filter-genre");
const filterFormat = document.getElementById("filter-format");
const filterCondition = document.getElementById("filter-condition");
const filterCountry = document.getElementById("filter-country");
const filterYearFrom = document.getElementById("filter-year-from");
const filterYearTo = document.getElementById("filter-year-to");
const filterResetBtn = document.getElementById("filter-reset-btn");
const heroSubtitle = document.getElementById("hero-subtitle");
const dashStatTotal = document.getElementById("dash-stat-total");
const dashStatArtists = document.getElementById("dash-stat-artists");
const dashStatCountry = document.getElementById("dash-stat-country");
const dashStatValue = document.getElementById("dash-stat-value");
const confirmModal = document.getElementById("confirm-modal");
const confirmText = document.getElementById("confirm-text");
const confirmOk = document.getElementById("confirm-ok");
const confirmCancel = document.getElementById("confirm-cancel");
const deleteAllBtn = document.getElementById("delete-all-btn");
const toastEl = document.getElementById("toast");
const scanToggle = document.getElementById("scan-toggle");
const scanToggleCollection = document.getElementById("scan-toggle-collection");
const scanModal = document.getElementById("scan-modal");
const scanStatus = document.getElementById("scan-status");
const scanResults = document.getElementById("scan-results");
const scanCancel = document.getElementById("scan-cancel");
const manualEntryBtn = document.getElementById("manual-entry-btn");
const manualEntryForm = document.getElementById("manual-entry-form");
const manualBarcodeInput = document.getElementById("manual-barcode-input");
const manualEntrySubmit = document.getElementById("manual-entry-submit");
const collectionsGrid = document.getElementById("collections-grid");
const recordCollectionField = document.getElementById("record-collection");
const noTargetCollectionHint = document.getElementById("no-target-collection-hint");
const newCollectionBtn = document.getElementById("new-collection-btn");
const collectionModal = document.getElementById("collection-modal");
const collectionNameInput = document.getElementById("collection-name-input");
const collectionCancel = document.getElementById("collection-cancel");
const collectionCreate = document.getElementById("collection-create");
const detailModal = document.getElementById("detail-modal");
const detailContent = document.getElementById("detail-content");
const detailClose = document.getElementById("detail-close");
const wishlistGrid = document.getElementById("wishlist-list");
const wishlistEmptyState = document.getElementById("wishlist-empty-state");
const wishlistSearchBtn = document.getElementById("wishlist-search-btn");
const wishlistSearchModal = document.getElementById("wishlist-search-modal");
const wishlistSearchInput = document.getElementById("wishlist-search-input");
const wishlistSearchSubmit = document.getElementById("wishlist-search-submit");
const wishlistSearchStatus = document.getElementById("wishlist-search-status");
const wishlistSearchResults = document.getElementById("wishlist-search-results");
const wishlistSearchCancel = document.getElementById("wishlist-search-cancel");
const dashboardView = document.getElementById("dashboard-view");
const collectionView = document.getElementById("collection-view");
const backToDashboardBtn = document.getElementById("back-to-dashboard");
const collectionTitle = document.getElementById("collection-title");
const collStatTotal = document.getElementById("coll-stat-total");
const collStatArtists = document.getElementById("coll-stat-artists");
const collStatCountry = document.getElementById("coll-stat-country");
const collStatValue = document.getElementById("coll-stat-value");
const manualSearchInput = document.getElementById("manual-search-input");
const manualSearchStatus = document.getElementById("manual-search-status");
const manualSearchResults = document.getElementById("manual-search-results");
const manualFormLink = document.getElementById("manual-form-link");
const promoteModal = document.getElementById("promote-modal");
const promoteSelect = document.getElementById("promote-select");
const promoteConfirm = document.getElementById("promote-confirm");
const promoteCancel = document.getElementById("promote-cancel");
const appShell = document.querySelector(".app");
const sidebarCollections = document.getElementById("sidebar-collections");
const navOverview = document.getElementById("nav-overview");
const sidebarNewCollection = document.getElementById("sidebar-new-collection");
const menuBtn = document.getElementById("menu-btn");
const discogsSearch = document.getElementById("discogs-search");
const dashStatValueSub = document.getElementById("dash-stat-value-sub");
const collStatValueSub = document.getElementById("coll-stat-value-sub");
const dashTrendChart = document.getElementById("dash-trend-chart");
const dashTrendSub = document.getElementById("dash-trend-sub");
const collTrendChart = document.getElementById("coll-trend-chart");
const collTrendSub = document.getElementById("coll-trend-sub");
const refreshPricesBtns = document.querySelectorAll(".refresh-prices-btn");
const viewGridBtn = document.getElementById("view-grid-btn");
const viewListBtn = document.getElementById("view-list-btn");
const recordsTable = document.getElementById("records-table");
const noResults = document.getElementById("no-results");
const duplicateHint = document.getElementById("duplicate-hint");
const purchasePriceField = document.getElementById("purchasePrice");
const purchaseDateField = document.getElementById("purchaseDate");
const purchaseSourceField = document.getElementById("purchaseSource");

let records = [];
let dashboardRecords = [];
let wishlist = [];
let collections = [];
let currentCollectionId = localStorage.getItem("vinyl-current-collection-id");
let currentView = "dashboard";
let confirmAction = null;
let toastTimer = null;
let html5QrCode = null;
let manualEntryTimer = null;
let promotingWishlistItemId = null;
let ownedRecords = null;
let viewMode = localStorage.getItem("vinyl-view-mode") === "list" ? "list" : "grid";
let sortKey = "artist";
let sortDir = 1;
let refreshPollTimer = null;
let chartGradientId = 0;

function recordsApiUrl() {
  return `/api/collections/${currentCollectionId}/records`;
}

function generalCollectionId() {
  const general = collections.find(c => !c.deletable);
  return general ? general.id : null;
}

async function loadCollections() {
  ownedRecords = null;
  const res = await fetch("/api/collections");
  collections = await res.json();

  if (!collections.some(c => String(c.id) === String(currentCollectionId))) {
    currentCollectionId = collections[0].id;
    localStorage.setItem("vinyl-current-collection-id", currentCollectionId);
  }

  renderCollectionsGrid();
  renderRecordCollectionOptions();

  if (currentView === "collection") {
    await loadRecords();
  } else {
    await loadDashboardStats();
  }
}

async function loadDashboardStats() {
  const generalId = generalCollectionId();
  if (!generalId) return;
  const res = await fetch(`/api/collections/${generalId}/records`);
  dashboardRecords = await res.json();
  ownedRecords = dashboardRecords;

  renderStats(dashboardRecords, {
    total: dashStatTotal, artists: dashStatArtists, country: dashStatCountry,
    value: dashStatValue, valueSub: dashStatValueSub,
  });
  loadValueHistory(generalId, dashTrendChart, dashTrendSub);

  const total = dashboardRecords.length;
  const ownCollections = collections.filter(c => c.deletable).length;
  heroSubtitle.textContent = `${total} ${total === 1 ? "Platte" : "Platten"} in ${ownCollections} ${ownCollections === 1 ? "Sammlung" : "Sammlungen"}`;
}

function renderCollectionsGrid() {
  collectionsGrid.innerHTML = "";
  collections.forEach(c => {
    const card = document.createElement("div");
    card.className = "tile" + (String(c.id) === String(currentCollectionId) && currentView === "collection" ? " active" : "");
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `${c.name}, ${c.recordCount} ${c.recordCount === 1 ? "Platte" : "Platten"}`);
    card.innerHTML = `
      <div class="cover" id="cover-${c.id}">${DISC_PLACEHOLDER}</div>
      <div class="caption">
        <div class="name">${escapeHtml(c.name)}</div>
        <div class="count">${c.recordCount} ${c.recordCount === 1 ? "Platte" : "Platten"}</div>
      </div>
      ${c.deletable ? `<button type="button" class="tile-rm" data-id="${c.id}" data-name="${escapeHtml(c.name)}" data-count="${c.recordCount}" aria-label="Sammlung ${escapeHtml(c.name)} löschen">×</button>` : ""}
    `;
    card.addEventListener("click", e => {
      if (e.target.closest("button")) return;
      openCollectionView(c.id);
    });
    card.addEventListener("keydown", e => {
      if (e.target !== card || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      openCollectionView(c.id);
    });
    collectionsGrid.appendChild(card);
  });

  renderSidebar();

  collectionsGrid.querySelectorAll(".tile-rm").forEach(btn =>
    btn.addEventListener("click", e => {
      e.stopPropagation();
      requestDeleteCollection(btn.dataset.id, btn.dataset.name, btn.dataset.count);
    })
  );

  collections.forEach(c => loadCollectionCover(c.id));
}

async function loadCollectionCover(collectionId) {
  const coverEl = document.getElementById(`cover-${collectionId}`);
  if (!coverEl) return;
  try {
    const res = await fetch(`/api/collections/${collectionId}/records`);
    const items = await res.json();
    const covers = items.map(r => r.coverImageUrl).filter(Boolean).slice(0, 4);
    if (covers.length === 0) return;

    coverEl.classList.add("has-covers");
    coverEl.innerHTML = Array.from({ length: 4 }, (_, i) =>
      covers[i]
        ? `<div class="cover-quad" style="background-image:url('${covers[i]}')"></div>`
        : `<div class="cover-quad empty"></div>`
    ).join("");
  } catch (err) {
    // Platzhalter-Textur bleibt bestehen
  }
}

function renderSidebar() {
  navOverview.classList.toggle("active", currentView === "dashboard");
  sidebarCollections.innerHTML = "";
  collections.forEach(c => {
    const item = document.createElement("button");
    item.type = "button";
    const isActive = currentView === "collection" && String(c.id) === String(currentCollectionId);
    item.className = "nav-item" + (isActive ? " active" : "");
    if (isActive) item.setAttribute("aria-current", "page");
    item.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/></svg>
      <span class="nav-label">${escapeHtml(c.name)}</span>
    `;
    item.addEventListener("click", () => {
      closeMenu();
      openCollectionView(c.id);
    });
    sidebarCollections.appendChild(item);
  });
}

function closeMenu() {
  appShell.classList.remove("menu-open");
  menuBtn.setAttribute("aria-expanded", "false");
}

function renderRecordCollectionOptions() {
  const targetable = collections.filter(c => c.deletable);
  recordCollectionField.innerHTML = "";
  targetable.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    recordCollectionField.appendChild(opt);
  });

  const canAdd = targetable.length > 0;
  noTargetCollectionHint.hidden = canAdd;
  scanToggle.disabled = !canAdd;
  scanToggleCollection.disabled = !canAdd;

  if (canAdd) {
    const defaultId = targetable.some(c => String(c.id) === String(currentCollectionId))
      ? currentCollectionId
      : targetable[0].id;
    recordCollectionField.value = defaultId;
  }
}

async function openCollectionView(id) {
  currentCollectionId = id;
  localStorage.setItem("vinyl-current-collection-id", currentCollectionId);
  currentView = "collection";
  resetForm();
  dashboardView.hidden = true;
  collectionView.hidden = false;
  recordsGrid.innerHTML = RECORD_SKELETONS;
  recordsTable.innerHTML = "";
  emptyState.hidden = true;
  noResults.hidden = true;
  renderCollectionsGrid();
  renderRecordCollectionOptions();
  await loadRecords();
}

function showDashboard() {
  currentView = "dashboard";
  resetForm();
  collectionView.hidden = true;
  dashboardView.hidden = false;
  renderCollectionsGrid();
  loadDashboardStats();
}

function openCollectionModal() {
  collectionNameInput.value = "";
  collectionModal.hidden = false;
  collectionNameInput.focus();
}

function closeCollectionModal() {
  collectionModal.hidden = true;
}

async function submitNewCollection() {
  const name = collectionNameInput.value.trim();
  if (!name) return;
  const res = await fetch("/api/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const created = await res.json();
  closeCollectionModal();
  await loadCollections();
  await openCollectionView(created.id);
  showToast("Sammlung erstellt");
}

function requestDeleteCollection(id, name, count) {
  confirmText.textContent = `Sammlung "${name}" wirklich löschen? Die ${count} enthaltenen Platten bleiben in "Alle Platten" erhalten.`;
  confirmAction = async () => {
    await fetch(`/api/collections/${id}`, { method: "DELETE" });
    if (String(currentCollectionId) === String(id)) {
      currentCollectionId = null;
    }
    await loadCollections();
    showToast("Sammlung gelöscht");
  };
  confirmModal.hidden = false;
}

async function loadRecords() {
  const res = await fetch(recordsApiUrl());
  records = await res.json();
  renderRecords();
  renderCollectionStats();
}

function renderCollectionStats() {
  const current = collections.find(c => String(c.id) === String(currentCollectionId));
  collectionTitle.textContent = current ? current.name : "Sammlung";

  renderStats(records, {
    total: collStatTotal, artists: collStatArtists, country: collStatCountry,
    value: collStatValue, valueSub: collStatValueSub,
  });
  loadValueHistory(currentCollectionId, collTrendChart, collTrendSub);
}

function renderStats(list, el) {
  const artists = new Set(list.map(r => r.artist.trim().toLowerCase())).size;

  const countryCounts = {};
  list.forEach(r => {
    if (r.country) countryCounts[r.country] = (countryCounts[r.country] || 0) + 1;
  });
  const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0];

  el.total.textContent = list.length;
  el.artists.textContent = artists;
  el.country.textContent = topCountry ? topCountry[0] : "–";

  // Summe der bekannten Marktpreise; Platten ohne Preis zählen nicht mit
  const priced = list.filter(r => r.lastKnownPrice != null);
  const currency = priced.length ? (priced[0].lastKnownPriceCurrency || "EUR") : "EUR";
  const value = priced.reduce((sum, r) => sum + r.lastKnownPrice, 0);
  el.value.textContent = priced.length ? formatMoney(value, currency) : "–";

  const notes = [];
  const unpriced = list.length - priced.length;
  if (unpriced > 0) notes.push(`<span>${unpriced} ohne Marktpreis</span>`);

  // Gewinn/Verlust nur über Platten, bei denen Kaufpreis und Marktwert bekannt sind
  const compared = priced.filter(r => r.purchasePrice != null);
  if (compared.length) {
    const paid = compared.reduce((sum, r) => sum + r.purchasePrice, 0);
    const worth = compared.reduce((sum, r) => sum + r.lastKnownPrice, 0);
    notes.push(`<span title="Kaufpreis der ${compared.length} Platten mit bekanntem Marktwert">Bezahlt ${escapeHtml(formatMoney(paid, currency))} ${gainBadge(worth - paid, paid, currency)}</span>`);
  }
  el.valueSub.innerHTML = notes.join("");
}

function formatMoney(value, currency) {
  try {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: currency || "EUR" }).format(value);
  } catch (err) {
    return `${value.toFixed(2)} ${currency || ""}`.trim();
  }
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" });
}

// Veränderung mit Vorzeichen, damit Gewinn und Verlust nicht nur an der Farbe erkennbar sind
function gainBadge(delta, base, currency) {
  const kind = delta > 0.005 ? "gain" : delta < -0.005 ? "loss" : "flat";
  const sign = kind === "gain" ? "+" : kind === "loss" ? "−" : "±";
  const pct = base > 0
    ? ` (${sign}${Math.abs((delta / base) * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 })} %)`
    : "";
  return `<span class="delta ${kind}">${sign}${escapeHtml(formatMoney(Math.abs(delta), currency))}${pct}</span>`;
}

// ---------- Wertentwicklung ----------

async function loadValueHistory(collectionId, chartEl, subEl) {
  try {
    const res = await fetch(`/api/collections/${collectionId}/value-history`);
    if (!res.ok) throw new Error("Wertverlauf nicht verfügbar");
    renderValueHistory(await res.json(), chartEl, subEl);
  } catch (err) {
    subEl.textContent = "Wertverlauf konnte nicht geladen werden.";
    chartEl.innerHTML = "";
  }
}

function renderValueHistory(history, chartEl, subEl) {
  const points = history.points || [];
  const currency = history.currency || "EUR";
  chartEl.history = points.length ? { points, currency } : null;

  if (points.length === 0) {
    subEl.textContent = "Noch keine Marktpreise. Platten mit Discogs-Verknüpfung bekommen automatisch einen Preis.";
    chartEl.innerHTML = "";
    return;
  }
  const first = points[0];
  const last = points[points.length - 1];
  subEl.innerHTML = points.length === 1
    ? `${escapeHtml(formatMoney(last.value, currency))} am ${formatDate(last.date)}. Der Verlauf erscheint ab der nächsten täglichen Aktualisierung.`
    : `${gainBadge(last.value - first.value, first.value, currency)} seit ${formatDate(first.date)}`;
  // ein einzelner Punkt ist noch kein Verlauf
  if (points.length === 1) {
    chartEl.history = null;
    chartEl.innerHTML = "";
    return;
  }
  drawValueChart(chartEl);
}

function drawValueChart(chartEl) {
  const { points, currency } = chartEl.history;
  const width = Math.max(chartEl.clientWidth, 280);
  const height = 168;
  const padX = 4;
  const padTop = 22;
  const padBottom = 26;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;

  const times = points.map(p => new Date(`${p.date}T00:00:00`).getTime());
  const t0 = times[0];
  const t1 = times[times.length - 1];
  const values = points.map(p => p.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const margin = (maxValue - minValue || Math.max(maxValue * 0.1, 1)) * 0.25;
  const lo = Math.max(0, minValue - margin);
  const hi = maxValue + margin;

  const x = i => padX + (t1 === t0 ? plotW / 2 : ((times[i] - t0) / (t1 - t0)) * plotW);
  const y = v => padTop + (1 - (v - lo) / (hi - lo)) * plotH;

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${padTop + plotH} L${x(0).toFixed(1)},${padTop + plotH} Z`;
  const gradientId = `trend-fill-${++chartGradientId}`;
  const lastIndex = points.length - 1;

  const dots = points.map((p, i) => `
    <circle cx="${x(i)}" cy="${y(p.value)}" r="${i === lastIndex ? 4.5 : points.length <= 40 ? 2.5 : 0}" class="${i === lastIndex ? "trend-dot last" : "trend-dot"}">
      <title>${formatDate(p.date)}: ${escapeHtml(formatMoney(p.value, currency))} (${p.pricedCount} ${p.pricedCount === 1 ? "Platte" : "Platten"} mit Preis)</title>
    </circle>`).join("");

  const dateLabels = t1 === t0
    ? `<text x="${width / 2}" y="${height - 6}" text-anchor="middle">${formatDate(points[0].date)}</text>`
    : `<text x="${padX}" y="${height - 6}">${formatDate(points[0].date)}</text>
       <text x="${width - padX}" y="${height - 6}" text-anchor="end">${formatDate(points[lastIndex].date)}</text>`;

  chartEl.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img"
      aria-label="Wertentwicklung von ${escapeHtml(formatMoney(points[0].value, currency))} auf ${escapeHtml(formatMoney(points[lastIndex].value, currency))}">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <line x1="${padX}" y1="${y(maxValue)}" x2="${width - padX}" y2="${y(maxValue)}" class="trend-grid"/>
      ${maxValue !== minValue ? `<line x1="${padX}" y1="${y(minValue)}" x2="${width - padX}" y2="${y(minValue)}" class="trend-grid"/>` : ""}
      <text x="${padX}" y="${y(maxValue) - 7}">${escapeHtml(formatMoney(maxValue, currency))}</text>
      ${maxValue !== minValue ? `<text x="${padX}" y="${y(minValue) - 7}">${escapeHtml(formatMoney(minValue, currency))}</text>` : ""}
      ${points.length > 1 ? `<path d="${area}" fill="url(#${gradientId})"/><path d="${line}" class="trend-line"/>` : ""}
      ${dots}
      ${dateLabels}
    </svg>
  `;
}

// Diagramme an die verfügbare Breite anpassen, z. B. beim Drehen des Geräts oder Einblenden der Ansicht
const chartResizeObserver = new ResizeObserver(entries => {
  entries.forEach(entry => {
    const chartEl = entry.target;
    const svg = chartEl.querySelector("svg");
    if (chartEl.history && chartEl.clientWidth && (!svg || Number(svg.getAttribute("width")) !== Math.max(chartEl.clientWidth, 280))) {
      drawValueChart(chartEl);
    }
  });
});
[dashTrendChart, collTrendChart].forEach(el => chartResizeObserver.observe(el));

// ---------- Preise aktualisieren ----------

async function startPriceRefresh() {
  try {
    const res = await fetch("/api/prices/refresh", { method: "POST" });
    if (!res.ok) throw new Error("Aktualisierung fehlgeschlagen");
    const status = await res.json();
    showRefreshProgress(status);
    if (status.running) pollPriceRefresh();
  } catch (err) {
    showToast("Preise konnten nicht aktualisiert werden", "error");
  }
}

function pollPriceRefresh() {
  clearTimeout(refreshPollTimer);
  refreshPollTimer = setTimeout(async () => {
    try {
      const status = await (await fetch("/api/prices/refresh")).json();
      showRefreshProgress(status);
      if (status.running) {
        pollPriceRefresh();
        return;
      }
      await loadCollections();
      showToast(status.failed ? `Preise aktualisiert, ${status.failed} nicht erreichbar` : "Preise aktualisiert");
    } catch (err) {
      showRefreshProgress({ running: false });
    }
  }, 2000);
}

function showRefreshProgress(status) {
  refreshPricesBtns.forEach(btn => {
    btn.disabled = status.running;
    btn.classList.toggle("is-busy", status.running);
    btn.querySelector(".refresh-label").textContent = !status.running
      ? "Preise aktualisieren"
      : status.total
        ? `Aktualisiere ${status.done} von ${status.total}`
        : "Wartet auf Discogs…";
  });
}

async function resumePriceRefresh() {
  try {
    const status = await (await fetch("/api/prices/refresh")).json();
    if (status.running) {
      showRefreshProgress(status);
      pollPriceRefresh();
    }
  } catch (err) {
    // Status ist nur eine Anzeige; ohne ihn bleibt der Knopf bedienbar
  }
}

// ---------- Doppelte Platten erkennen ----------

async function getOwnedRecords() {
  if (ownedRecords) return ownedRecords;
  const generalId = generalCollectionId();
  if (!generalId) return [];
  try {
    ownedRecords = await (await fetch(`/api/collections/${generalId}/records`)).json();
  } catch (err) {
    return [];
  }
  return ownedRecords;
}

function findOwned(owned, releaseId, barcode) {
  return owned.find(r =>
    (releaseId && String(r.discogsReleaseId) === String(releaseId)) || (barcode && r.barcode === barcode)
  ) || null;
}

function collectionNameOf(record) {
  const collection = collections.find(c => String(c.id) === String(record.collectionId));
  return collection ? collection.name : "Alle Platten";
}

function ownedBadge(record) {
  return record ? `<span class="owned-badge">In ${escapeHtml(collectionNameOf(record))}</span>` : "";
}

async function showDuplicateHint(releaseId, barcode) {
  duplicateHint.hidden = true;
  if (idField.value) return;
  const match = findOwned(await getOwnedRecords(), releaseId, barcode);
  if (!match || idField.value) return;
  duplicateHint.innerHTML = `<strong>Hast du schon:</strong> „${escapeHtml(match.title)}“ von ${escapeHtml(match.artist)} in ${escapeHtml(collectionNameOf(match))}${match.condition ? `, Zustand ${escapeHtml(match.condition)}` : ""}. Speichern legt ein weiteres Exemplar an.`;
  duplicateHint.hidden = false;
}

const SEARCHABLE_FIELDS = [
  "artist", "title", "genre", "styles", "country", "label", "catalogNumber",
  "format", "condition", "notes", "tracklist", "barcode", "releaseYear",
];

function matchesQuery(record, query) {
  if (!query) return true;
  return SEARCHABLE_FIELDS.some(field => {
    const value = record[field];
    return value != null && String(value).toLowerCase().includes(query);
  });
}

function matchesFilters(record) {
  if (filterGenre.value && record.genre !== filterGenre.value) return false;
  if (filterFormat.value && record.format !== filterFormat.value) return false;
  if (filterCondition.value && record.condition !== filterCondition.value) return false;
  if (filterCountry.value && !(record.country || "").toLowerCase().includes(filterCountry.value.trim().toLowerCase())) return false;
  if (filterYearFrom.value && (!record.releaseYear || record.releaseYear < parseInt(filterYearFrom.value, 10))) return false;
  if (filterYearTo.value && (!record.releaseYear || record.releaseYear > parseInt(filterYearTo.value, 10))) return false;
  return true;
}

function hasActiveFilters() {
  return Boolean(filterGenre.value || filterFormat.value || filterCondition.value ||
    filterCountry.value || filterYearFrom.value || filterYearTo.value);
}

const CONDITION_ORDER = ["Mint (M)", "Near Mint (NM)", "Sehr gut+ (VG+)", "Sehr gut (VG)", "Gut (G)", "Befriedigend (F)"];

const SORT_VALUES = {
  title: r => r.title,
  artist: r => r.artist,
  releaseYear: r => r.releaseYear,
  genre: r => r.genre,
  condition: r => (CONDITION_ORDER.includes(r.condition) ? CONDITION_ORDER.indexOf(r.condition) : null),
  country: r => r.country,
  lastKnownPrice: r => r.lastKnownPrice,
  purchasePrice: r => r.purchasePrice,
};

function compareRecords(a, b) {
  const va = SORT_VALUES[sortKey](a);
  const vb = SORT_VALUES[sortKey](b);
  const emptyA = va == null || va === "";
  const emptyB = vb == null || vb === "";
  // leere Werte stehen unabhängig von der Richtung immer am Ende
  if (emptyA !== emptyB) return emptyA ? 1 : -1;
  const result = emptyA ? 0 : typeof va === "number" ? va - vb : String(va).localeCompare(String(vb), "de");
  return result * sortDir || a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title);
}

function renderRecords() {
  const query = searchField.value.trim().toLowerCase();
  const filtered = records.filter(r => matchesQuery(r, query) && matchesFilters(r));
  const sorted = filtered.sort(compareRecords);
  filterToggleBtn.classList.toggle("active", hasActiveFilters());

  recordsGrid.innerHTML = "";
  emptyState.hidden = records.length > 0;
  noResults.hidden = records.length === 0 || filtered.length > 0;
  recordsGrid.hidden = viewMode !== "grid";
  recordsTable.hidden = viewMode !== "list" || filtered.length === 0;

  if (viewMode === "list") {
    renderRecordsTable(sorted);
    return;
  }

  sorted.forEach(record => {
    const tile = document.createElement("div");
    tile.className = "rec-tile";
    tile.tabIndex = 0;
    tile.setAttribute("role", "button");
    tile.setAttribute("aria-label", `${record.artist} – ${record.title}`);
    tile.innerHTML = `
      <div class="cover${record.coverImageUrl ? " has-image" : ""}"${record.coverImageUrl ? ` style="background-image:url('${record.coverImageUrl}')"` : ""}>${record.coverImageUrl ? "" : DISC_PLACEHOLDER}</div>
      <button type="button" class="rm" data-id="${record.id}" aria-label="${escapeHtml(record.title)} löschen">×</button>
      <div class="info">
        <div class="title">${escapeHtml(record.title)}</div>
        <div class="artist">${escapeHtml(record.artist)}${record.releaseYear ? ` · ${record.releaseYear}` : ""}</div>
      </div>
    `;
    tile.addEventListener("click", e => {
      if (e.target.closest("button")) return;
      openDetail(record.id);
    });
    tile.addEventListener("keydown", e => {
      if (e.target !== tile || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      openDetail(record.id);
    });
    recordsGrid.appendChild(tile);
  });

  recordsGrid.querySelectorAll(".rm").forEach(btn =>
    btn.addEventListener("click", e => {
      e.stopPropagation();
      requestDelete(btn.dataset.id);
    })
  );
}

const TABLE_COLUMNS = [
  { key: "title", label: "Titel", cls: "col-title" },
  { key: "artist", label: "Interpret", cls: "col-artist" },
  { key: "releaseYear", label: "Jahr", cls: "col-num col-hide-sm" },
  { key: "genre", label: "Genre", cls: "col-hide-md" },
  { key: "condition", label: "Zustand", cls: "col-hide-sm" },
  { key: "country", label: "Land", cls: "col-hide-md" },
  { key: "lastKnownPrice", label: "Marktwert", cls: "col-num" },
  { key: "purchasePrice", label: "Kaufpreis", cls: "col-num col-hide-sm" },
];

const TRASH_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4h6v3"/></svg>`;

function conditionBadge(condition) {
  if (!condition) return "";
  const short = (condition.match(/\(([^)]+)\)/) || [])[1] || condition;
  return `<span class="cond-badge" title="${escapeHtml(condition)}">${escapeHtml(short)}</span>`;
}

function renderRecordsTable(sorted) {
  const head = TABLE_COLUMNS.map(c => {
    const sort = c.key === sortKey ? ` aria-sort="${sortDir === 1 ? "ascending" : "descending"}"` : "";
    return `<th scope="col" class="${c.cls}"${sort}><button type="button" class="sort-btn" data-sort="${c.key}">${c.label}</button></th>`;
  }).join("");

  const rows = sorted.map(r => `
    <tr data-id="${r.id}" tabindex="0" aria-label="${escapeHtml(r.artist)} – ${escapeHtml(r.title)}">
      <td class="col-art"><span class="row-art"${r.coverImageUrl ? ` style="background-image:url('${escapeHtml(r.coverImageUrl)}')"` : ""}></span></td>
      <td class="col-title"><span class="cell-title">${escapeHtml(r.title)}</span><span class="cell-sub">${escapeHtml(r.artist)}</span></td>
      <td class="col-artist">${escapeHtml(r.artist)}</td>
      <td class="col-num col-hide-sm">${r.releaseYear ?? ""}</td>
      <td class="col-hide-md">${escapeHtml(r.genre || "")}</td>
      <td class="col-hide-sm">${conditionBadge(r.condition)}</td>
      <td class="col-hide-md">${escapeHtml(r.country || "")}</td>
      <td class="col-num col-value">${r.lastKnownPrice != null ? escapeHtml(formatMoney(r.lastKnownPrice, r.lastKnownPriceCurrency)) : `<span class="cell-empty">–</span>`}</td>
      <td class="col-num col-hide-sm">${r.purchasePrice != null ? escapeHtml(formatMoney(r.purchasePrice, r.lastKnownPriceCurrency)) : `<span class="cell-empty">–</span>`}</td>
      <td class="col-actions"><button type="button" class="row-rm" data-id="${r.id}" aria-label="${escapeHtml(r.title)} löschen">${TRASH_ICON}</button></td>
    </tr>`).join("");

  recordsTable.innerHTML = `
    <table class="rec-table">
      <thead><tr><th class="col-art"><span class="sr-only">Cover</span></th>${head}<th class="col-actions"><span class="sr-only">Aktionen</span></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function syncViewButtons() {
  viewGridBtn.setAttribute("aria-pressed", String(viewMode === "grid"));
  viewListBtn.setAttribute("aria-pressed", String(viewMode === "list"));
}

function setViewMode(mode) {
  viewMode = mode;
  localStorage.setItem("vinyl-view-mode", mode);
  syncViewButtons();
  renderRecords();
}

function closeDetail() {
  detailModal.hidden = true;
  detailContent.innerHTML = "";
}

function metaItem(label, value) {
  if (!value) return "";
  return `<span class="detail-chip"><span class="detail-chip-label">${escapeHtml(label)}</span>${escapeHtml(String(value))}</span>`;
}

function purchaseSection(record) {
  if (record.purchasePrice == null && !record.purchaseDate && !record.purchaseSource) return "";
  const currency = record.lastKnownPriceCurrency || "EUR";
  const comparison = record.purchasePrice != null && record.lastKnownPrice != null
    ? `<span class="detail-chip"><span class="detail-chip-label">Gegenüber Marktwert</span>${gainBadge(record.lastKnownPrice - record.purchasePrice, record.purchasePrice, currency)}</span>`
    : "";
  return `
    <div class="detail-section">
      <h4>Kauf</h4>
      <div class="detail-chip-row purchase-row">
        ${metaItem("Kaufpreis", record.purchasePrice != null ? formatMoney(record.purchasePrice, currency) : "")}
        ${metaItem("Kaufdatum", record.purchaseDate ? formatDate(record.purchaseDate) : "")}
        ${metaItem("Gekauft bei", record.purchaseSource)}
        ${comparison}
      </div>
    </div>
  `;
}

function openDetail(id) {
  const record = records.find(r => String(r.id) === String(id));
  if (!record) return;

  const metaItems = [
    metaItem("Genre", record.genre),
    metaItem("Styles", record.styles),
    metaItem("Jahr", record.releaseYear),
    metaItem("Format", record.format),
    metaItem("Zustand", record.condition),
    metaItem("Land", record.country),
    metaItem("Label", record.label),
    metaItem("Katalognummer", record.catalogNumber),
    metaItem("Barcode", record.barcode),
  ].join("");

  const tracklistRows = record.tracklist
    ? record.tracklist.split("\n").filter(line => line.trim()).map(line => `<div class="tracklist-row">${escapeHtml(line)}</div>`).join("")
    : "";

  detailContent.innerHTML = `
    <div class="detail-header">
      ${record.coverImageUrl ? `<img class="detail-cover" src="${record.coverImageUrl}" alt="Cover von ${escapeHtml(record.title)}" loading="lazy">` : `<div class="detail-cover detail-cover-placeholder">${DISC_PLACEHOLDER}</div>`}
      <div class="detail-header-text">
        <div class="kicker">${escapeHtml(record.genre || "Sonstiges")}${record.releaseYear ? ` · ${record.releaseYear}` : ""}</div>
        <h3 class="detail-title">${escapeHtml(record.title)}</h3>
        <p class="detail-artist">${escapeHtml(record.artist)}</p>
      </div>
    </div>
    ${metaItems ? `<div class="detail-chip-row">${metaItems}</div>` : ""}
    <div class="detail-body">
      ${tracklistRows ? `<div class="detail-section"><h4>Tracklist</h4><div class="tracklist">${tracklistRows}</div></div>` : ""}
      ${record.notes ? `<div class="detail-section"><h4>Notizen</h4><p>${escapeHtml(record.notes)}</p></div>` : ""}
      ${purchaseSection(record)}
    </div>
    <div class="detail-section detail-market" id="detail-market">
      <h4>Marktwert</h4>
      <p id="detail-market-body">${record.discogsReleaseId ? "Lade…" : "Kein Discogs-Treffer verknüpft (nur bei per Scan/Suche hinzugefügten Platten verfügbar)."}</p>
      ${record.discogsReleaseId ? `<button type="button" class="btn-outline secondary price-analysis-btn" id="price-analysis-btn">Preisanalyse anzeigen</button>
      <div id="price-analysis-result"></div>` : ""}
    </div>
    <div class="detail-actions">
      <button type="button" class="btn-primary" id="detail-edit-btn">Bearbeiten</button>
      <button type="button" class="btn-outline secondary" id="detail-delete-btn">Löschen</button>
    </div>
  `;

  detailModal.hidden = false;

  document.getElementById("detail-edit-btn").addEventListener("click", () => {
    closeDetail();
    startEdit(record.id);
  });
  document.getElementById("detail-delete-btn").addEventListener("click", () => {
    closeDetail();
    requestDelete(record.id);
  });

  if (record.discogsReleaseId) {
    loadMarketStats(record.discogsReleaseId);
    document.getElementById("price-analysis-btn").addEventListener("click", () => loadPriceAnalysis(record.discogsReleaseId));
  }
}

async function loadMarketStats(releaseId) {
  const body = document.getElementById("detail-market-body");
  try {
    const res = await fetch(`/api/discogs/stats/${releaseId}`);
    if (!res.ok) throw new Error("Marktdaten nicht verfügbar");
    const stats = await res.json();
    if (!body) return;
    if (stats.lowestPrice == null) {
      body.textContent = "Aktuell keine Angebote auf Discogs gefunden.";
      return;
    }
    body.innerHTML = `
      <span class="detail-market-value">ab ${escapeHtml(formatMoney(stats.lowestPrice, stats.currency))}</span><br>
      ${stats.numForSale} Exemplar${stats.numForSale === 1 ? "" : "e"} aktuell im Discogs-Marktplatz
    `;
  } catch (err) {
    if (body) body.textContent = "Marktdaten konnten nicht geladen werden.";
  }
}

async function loadPriceAnalysis(releaseId) {
  const btn = document.getElementById("price-analysis-btn");
  const result = document.getElementById("price-analysis-result");
  if (!btn || !result) return;

  btn.disabled = true;
  btn.textContent = "Lade Preisvergleich… (kann einige Sekunden dauern)";
  result.innerHTML = "";

  try {
    const res = await fetch(`/api/discogs/price-analysis/${releaseId}`);
    if (!res.ok) throw new Error("Preisanalyse fehlgeschlagen");
    const analysis = await res.json();
    renderPriceChart(result, analysis.points || []);
    btn.hidden = true;
  } catch (err) {
    result.innerHTML = `<p>Preisanalyse konnte nicht geladen werden.</p>`;
    btn.disabled = false;
    btn.textContent = "Preisanalyse anzeigen";
  }
}

function renderPriceChart(container, points) {
  if (points.length === 0) {
    container.innerHTML = `<p>Keine Marktdaten für andere Pressungen gefunden.</p>`;
    return;
  }

  const sorted = points.slice().sort((a, b) => a.lowestPrice - b.lowestPrice);
  const maxPrice = Math.max(...sorted.map(p => p.lowestPrice));
  const minPrice = Math.min(...sorted.map(p => p.lowestPrice));
  const avgPrice = sorted.reduce((sum, p) => sum + p.lowestPrice, 0) / sorted.length;
  const currency = sorted[0].currency || "";

  const rows = sorted.map(p => {
    const widthPct = Math.max((p.lowestPrice / maxPrice) * 100, 4);
    return `
      <div class="price-bar-row${p.owned ? " owned" : ""}" title="${p.numForSale} Exemplar${p.numForSale === 1 ? "" : "e"} im Angebot">
        <span class="price-bar-label">${escapeHtml(p.label)}${p.owned ? ` <span class="price-bar-owned-tag">deine Pressung</span>` : ""}</span>
        <div class="price-bar-track">
          <div class="price-bar-fill" style="width: ${widthPct}%"></div>
        </div>
        <span class="price-bar-value">${escapeHtml(formatMoney(p.lowestPrice, p.currency))}</span>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="price-stats">
      <div class="price-stat-card">
        <span class="price-stat-value">${escapeHtml(formatMoney(minPrice, currency))}</span>
        <span class="price-stat-label">Min</span>
      </div>
      <div class="price-stat-card">
        <span class="price-stat-value">${escapeHtml(formatMoney(avgPrice, currency))}</span>
        <span class="price-stat-label">Durchschnitt</span>
      </div>
      <div class="price-stat-card">
        <span class="price-stat-value">${escapeHtml(formatMoney(maxPrice, currency))}</span>
        <span class="price-stat-label">Max</span>
      </div>
    </div>
    <p class="price-chart-caption">Niedrigster Angebotspreis je Pressung (${sorted.length} verglichen)</p>
    <div class="price-chart">${rows}</div>
    <p class="price-chart-caption">Preisverlauf über die Pressungen</p>
    <div id="price-line-chart"></div>
  `;

  renderPriceLineChart(document.getElementById("price-line-chart"), sorted, { minPrice, maxPrice, avgPrice });
}

function renderPriceLineChart(container, sorted, { minPrice, maxPrice, avgPrice }) {
  const width = 640;
  const height = 220;
  const padLeft = 46;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 34;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const range = maxPrice - minPrice || 1;

  const x = i => padLeft + (sorted.length === 1 ? plotW / 2 : (i / (sorted.length - 1)) * plotW);
  const y = price => padTop + (1 - (price - minPrice) / range) * plotH;

  const linePoints = sorted.map((p, i) => `${x(i)},${y(p.lowestPrice)}`).join(" ");
  const avgY = y(avgPrice);

  const dots = sorted.map((p, i) => `
    <circle cx="${x(i)}" cy="${y(p.lowestPrice)}" r="${p.owned ? 6 : 3.5}"
      fill="${p.owned ? "var(--accent)" : "var(--muted)"}" stroke="var(--surface)" stroke-width="2">
      <title>${escapeHtml(p.label)}: ${p.lowestPrice.toFixed(2)} ${escapeHtml(p.currency || "")}</title>
    </circle>
  `).join("");

  // flache Beschriftung, bei vielen Pressungen nur jede n-te
  const labelStep = Math.max(1, Math.ceil(sorted.length / 6));
  const xLabels = sorted.map((p, i) => (i % labelStep === 0 || p.owned) ? `
    <text x="${x(i)}" y="${height - 12}" font-size="12" text-anchor="${i === 0 ? "start" : i === sorted.length - 1 ? "end" : "middle"}"
      fill="${p.owned ? "var(--text)" : "var(--faint)"}">${escapeHtml(truncateLabel(p.label))}</text>
  ` : "").join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="price-line-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Niedrigster Preis je Pressung">
      <line x1="${padLeft}" y1="${y(maxPrice)}" x2="${width - padRight}" y2="${y(maxPrice)}" stroke="var(--rule)" stroke-width="1" />
      <line x1="${padLeft}" y1="${y(minPrice)}" x2="${width - padRight}" y2="${y(minPrice)}" stroke="var(--rule)" stroke-width="1" />
      <line x1="${padLeft}" y1="${avgY}" x2="${width - padRight}" y2="${avgY}" stroke="var(--control)" stroke-width="1" stroke-dasharray="4 4" />
      <text x="${width - padRight}" y="${avgY - 6}" font-size="12" text-anchor="end" fill="var(--muted)">Ø ${avgPrice.toFixed(2)}</text>
      <text x="${padLeft - 8}" y="${y(maxPrice) + 4}" font-size="12" text-anchor="end" fill="var(--faint)">${maxPrice.toFixed(0)}</text>
      <text x="${padLeft - 8}" y="${y(minPrice) + 4}" font-size="12" text-anchor="end" fill="var(--faint)">${minPrice.toFixed(0)}</text>
      <polyline points="${linePoints}" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
      ${dots}
      ${xLabels}
    </svg>
  `;
}

function truncateLabel(label) {
  return label.length > 12 ? label.slice(0, 11) + "…" : label;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function fillFormFromRelease(release) {
  artistField.value = release.artist || "";
  titleField.value = release.title || "";
  genreField.value = matchOption(genreField, release.genre);
  releaseYearField.value = release.releaseYear || "";
  formatField.value = matchOption(formatField, release.format);
  stylesField.value = release.styles || "";
  countryField.value = release.country || "";
  labelField.value = release.label || "";
  catalogNumberField.value = release.catalogNumber || "";
  coverImageUrlField.value = release.coverImageUrl || "";
  tracklistField.value = release.tracklist || "";
}

function openForm() {
  formCard.hidden = false;
  form.hidden = false;
  renderRecordCollectionOptions();
  formCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function startEdit(id) {
  const record = records.find(r => String(r.id) === String(id));
  if (!record) return;
  openForm();
  idField.value = record.id;
  recordCollectionField.value = record.collectionId;
  barcodeField.value = record.barcode || "";
  discogsReleaseIdField.value = record.discogsReleaseId || "";
  artistField.value = record.artist;
  titleField.value = record.title;
  genreField.value = record.genre;
  releaseYearField.value = record.releaseYear || "";
  formatField.value = record.format;
  conditionField.value = record.condition;
  notesField.value = record.notes || "";
  stylesField.value = record.styles || "";
  countryField.value = record.country || "";
  labelField.value = record.label || "";
  catalogNumberField.value = record.catalogNumber || "";
  coverImageUrlField.value = record.coverImageUrl || "";
  tracklistField.value = record.tracklist || "";
  purchasePriceField.value = record.purchasePrice ?? "";
  purchaseDateField.value = record.purchaseDate || "";
  purchaseSourceField.value = record.purchaseSource || "";
  duplicateHint.hidden = true;
  submitBtn.textContent = "Speichern";
  artistField.focus();
}

function resetForm() {
  form.reset();
  idField.value = "";
  barcodeField.value = "";
  discogsReleaseIdField.value = "";
  submitBtn.textContent = "Hinzufügen";
  duplicateHint.hidden = true;
  form.hidden = true;
  formCard.hidden = true;
}

function requestDelete(id) {
  confirmText.textContent = "Diesen Eintrag löschen?";
  confirmAction = async () => {
    await fetch(`${recordsApiUrl()}/${id}`, { method: "DELETE" });
    await loadRecords();
    showToast("Platte gelöscht");
  };
  confirmModal.hidden = false;
}

function requestDeleteAll() {
  const current = collections.find(c => String(c.id) === String(currentCollectionId));
  const isGeneral = current && !current.deletable;
  confirmText.textContent = isGeneral
    ? "Wirklich ALLE Platten aus jeder Sammlung unwiderruflich löschen?"
    : "Wirklich alle Platten aus dieser Sammlung entfernen? Sie bleiben in \"Alle Platten\" erhalten.";
  confirmAction = async () => {
    await fetch(recordsApiUrl(), { method: "DELETE" });
    await loadCollections();
    showToast(isGeneral ? "Alle Platten gelöscht" : "Sammlung geleert");
  };
  confirmModal.hidden = false;
}

function closeConfirm() {
  confirmAction = null;
  confirmModal.hidden = true;
}

function showToast(message, kind = "success") {
  toastEl.textContent = message;
  toastEl.dataset.kind = kind;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.hidden = true), 2200);
}

function matchOption(selectEl, value) {
  if (!value) return selectEl.value;
  const lower = value.toLowerCase();
  for (const opt of selectEl.options) {
    if (opt.value.toLowerCase() === lower) return opt.value;
  }
  return selectEl.value;
}

async function openScanModal() {
  scanModal.hidden = false;
  scanStatus.hidden = false;
  scanStatus.textContent = "Kamera wird gestartet…";
  scanResults.hidden = true;
  scanResults.innerHTML = "";
  manualEntryBtn.hidden = true;
  manualEntryForm.hidden = true;
  manualBarcodeInput.value = "";
  await startScan();
}

async function closeScanModal() {
  clearManualEntryTimer();
  await stopScan();
  scanModal.hidden = true;
}

function clearManualEntryTimer() {
  if (manualEntryTimer) {
    clearTimeout(manualEntryTimer);
    manualEntryTimer = null;
  }
}

function showManualEntryOption() {
  manualEntryBtn.hidden = false;
}

async function startScan() {
  try {
    html5QrCode = new Html5Qrcode("scan-reader");
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 120 },
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
      ],
    };
    await html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess);
    scanStatus.textContent = "Barcode in den Rahmen halten…";
    clearManualEntryTimer();
    manualEntryTimer = setTimeout(showManualEntryOption, 5000);
  } catch (err) {
    scanStatus.textContent = "Kamera konnte nicht gestartet werden. Bitte Berechtigung prüfen oder manuell eingeben.";
    showManualEntryOption();
  }
}

async function stopScan() {
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
    } catch (err) {
      // Kamera war bereits gestoppt
    }
    html5QrCode = null;
  }
}

function openManualEntryForm() {
  clearManualEntryTimer();
  manualEntryBtn.hidden = true;
  manualEntryForm.hidden = false;
  manualBarcodeInput.focus();
}

async function submitManualEntry() {
  const code = manualBarcodeInput.value.trim();
  if (!code) return;
  await onScanSuccess(code);
}

async function onScanSuccess(decodedText) {
  clearManualEntryTimer();
  await stopScan();
  scanStatus.textContent = `Suche Discogs-Treffer für ${decodedText}…`;
  await lookupBarcode(decodedText);
}

async function lookupBarcode(code) {
  try {
    const res = await fetch(`/api/discogs/search?barcode=${encodeURIComponent(code)}`);
    if (!res.ok) throw new Error("Discogs-Suche fehlgeschlagen");
    const results = await res.json();

    if (results.length === 0) {
      await closeScanModal();
      resetForm();
      openForm();
      barcodeField.value = code;
      showDuplicateHint(null, code);
      showToast("Kein Discogs-Treffer gefunden – bitte manuell eingeben", "info");
      return;
    }

    if (results.length === 1) {
      await applyRelease(results[0].id, code);
      return;
    }

    await showResultPicker(results, code);
  } catch (err) {
    await closeScanModal();
    resetForm();
    openForm();
    barcodeField.value = code;
    showDuplicateHint(null, code);
    showToast("Discogs nicht erreichbar – bitte manuell eingeben", "error");
  }
}

// Discogs titles read "Artist - Album"; show the album first, the artist under it,
// then the pressing details people use to tell releases apart.
function releasePreview(r, owned) {
  const split = (r.title || "").indexOf(" - ");
  const artist = split > 0 ? r.title.slice(0, split) : "";
  const album = split > 0 ? r.title.slice(split + 3) : (r.title || "");
  const formats = [...new Set((r.formats || []).filter(f => f && f !== "Vinyl"))].slice(0, 3);
  const isVinyl = !r.formats || r.formats.length === 0 || r.formats.includes("Vinyl");
  const meta = [
    r.year,
    r.country,
    isVinyl ? formats.join(", ") : (r.formats || []).slice(0, 3).join(", "),
    r.labels && r.labels[0],
    r.catalogNumber
  ].filter(Boolean).map(v => escapeHtml(String(v))).join(" · ");
  const thumb = r.thumb && !r.thumb.includes("spacer.gif") ? r.thumb : "";
  return `
    <span class="rp-art${isVinyl ? "" : " no-disc"}" aria-hidden="true">
      <span class="rp-disc"></span>
      <span class="rp-cover"${thumb ? ` style="background-image:url('${escapeHtml(thumb)}')"` : ""}></span>
    </span>
    <span class="rp-text">
      <span class="rp-title">${escapeHtml(album)}</span>
      ${artist ? `<span class="rp-artist">${escapeHtml(artist)}</span>` : ""}
      ${meta ? `<span class="rp-meta">${meta}</span>` : ""}
    </span>
    ${ownedBadge(findOwned(owned, r.id, null))}`;
}

async function showResultPicker(results, code) {
  const owned = await getOwnedRecords();
  scanStatus.textContent = "Mehrere Treffer gefunden – bitte auswählen:";
  scanResults.hidden = false;
  scanResults.innerHTML = "";
  results.forEach(r => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "scan-result-item";
    btn.innerHTML = `
      ${releasePreview(r, owned)}`;
    btn.addEventListener("click", () => applyRelease(r.id, code));
    scanResults.appendChild(btn);
  });
}

async function applyRelease(releaseId, code) {
  try {
    const res = await fetch(`/api/discogs/release/${releaseId}`);
    if (!res.ok) throw new Error("Discogs-Release fehlgeschlagen");
    const release = await res.json();
    await closeScanModal();
    resetForm();
    openForm();
    barcodeField.value = code;
    discogsReleaseIdField.value = releaseId;
    fillFormFromRelease(release);
    showDuplicateHint(releaseId, code);
    showToast("Daten von Discogs geladen – bitte prüfen und ergänzen");
    artistField.focus();
  } catch (err) {
    await closeScanModal();
    resetForm();
    openForm();
    barcodeField.value = code;
    showDuplicateHint(null, code);
    showToast("Discogs-Daten konnten nicht geladen werden – bitte manuell eingeben", "error");
  }
}

// Live search: wait for a short typing pause, reuse answers for queries already asked,
// and drop responses that arrive after the query has moved on.
const LIVE_SEARCH_DELAY = 400;
const LIVE_SEARCH_MIN_CHARS = 3;
const searchCache = new Map();
let searchTimer = null;
let searchSeq = 0;

async function searchDiscogs(query) {
  const key = query.toLowerCase();
  if (searchCache.has(key)) return searchCache.get(key);
  const res = await fetch(`/api/discogs/search-text?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Discogs-Suche fehlgeschlagen");
  const results = await res.json();
  searchCache.set(key, results);
  return results;
}

function scheduleManualSearch() {
  clearTimeout(searchTimer);
  const query = manualSearchInput.value.trim();
  if (query.length < LIVE_SEARCH_MIN_CHARS) {
    searchSeq++;
    closeManualSearchResults();
    return;
  }
  searchTimer = setTimeout(submitManualSearch, LIVE_SEARCH_DELAY);
}

async function submitManualSearch() {
  clearTimeout(searchTimer);
  const query = manualSearchInput.value.trim();
  if (!query) return;
  const seq = ++searchSeq;

  // keep the previous results visible while the next ones load, so typing doesn't flicker
  if (!manualSearchResults.children.length) {
    manualSearchStatus.hidden = false;
    manualSearchStatus.textContent = "Suche läuft…";
  }

  try {
    const results = await searchDiscogs(query);
    if (seq !== searchSeq) return;
    manualSearchResults.innerHTML = "";

    if (results.length === 0) {
      manualSearchStatus.hidden = false;
      manualSearchStatus.textContent = "Keine Treffer gefunden.";
      return;
    }

    const owned = await getOwnedRecords();
    if (seq !== searchSeq) return;
    manualSearchStatus.hidden = true;
    results.slice(0, 8).forEach(r => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "suggestion";
      btn.innerHTML = releasePreview(r, owned);
      btn.addEventListener("click", () => applyManualSearchResult(r.id));
      manualSearchResults.appendChild(btn);
    });
  } catch (err) {
    if (seq !== searchSeq) return;
    manualSearchResults.innerHTML = "";
    manualSearchStatus.hidden = false;
    manualSearchStatus.textContent = "Discogs nicht erreichbar.";
  }
}

async function applyManualSearchResult(releaseId) {
  try {
    const res = await fetch(`/api/discogs/release/${releaseId}`);
    if (!res.ok) throw new Error("Discogs-Release fehlgeschlagen");
    const release = await res.json();
    closeManualSearchResults();
    resetForm();
    openForm();
    discogsReleaseIdField.value = releaseId;
    fillFormFromRelease(release);
    showDuplicateHint(releaseId, null);
    showToast("Daten von Discogs geladen – bitte prüfen und ergänzen");
    artistField.focus();
  } catch (err) {
    showToast("Discogs-Daten konnten nicht geladen werden", "error");
  }
}

newCollectionBtn.addEventListener("click", e => { e.preventDefault(); openCollectionModal(); });
collectionCancel.addEventListener("click", closeCollectionModal);
collectionCreate.addEventListener("click", submitNewCollection);
collectionModal.addEventListener("click", e => {
  if (e.target === collectionModal) closeCollectionModal();
});
collectionNameInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitNewCollection();
  }
});

scanToggle.addEventListener("click", openScanModal);
scanToggleCollection.addEventListener("click", openScanModal);
scanCancel.addEventListener("click", closeScanModal);
scanModal.addEventListener("click", e => {
  if (e.target === scanModal) closeScanModal();
});

manualEntryBtn.addEventListener("click", openManualEntryForm);
manualEntrySubmit.addEventListener("click", submitManualEntry);
manualBarcodeInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitManualEntry();
  }
});

formToggle.addEventListener("click", () => {
  if (form.hidden) openForm();
  else resetForm();
});

manualFormLink.addEventListener("click", e => {
  e.preventDefault();
  resetForm();
  openForm();
});

manualSearchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitManualSearch();
  }
});
manualSearchInput.addEventListener("input", scheduleManualSearch);
manualSearchInput.addEventListener("focus", () => {
  if (!manualSearchResults.children.length) scheduleManualSearch();
});

backToDashboardBtn.addEventListener("click", e => {
  e.preventDefault();
  showDashboard();
});

confirmOk.addEventListener("click", async () => {
  const action = confirmAction;
  closeConfirm();
  if (action) await action();
});

confirmCancel.addEventListener("click", closeConfirm);
confirmModal.addEventListener("click", e => {
  if (e.target === confirmModal) closeConfirm();
});

deleteAllBtn.addEventListener("click", requestDeleteAll);

detailClose.addEventListener("click", closeDetail);
detailModal.addEventListener("click", e => {
  if (e.target === detailModal) closeDetail();
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  const payload = {
    artist: artistField.value.trim(),
    title: titleField.value.trim(),
    genre: genreField.value,
    releaseYear: releaseYearField.value ? parseInt(releaseYearField.value, 10) : null,
    format: formatField.value,
    condition: conditionField.value,
    notes: notesField.value.trim() || null,
    barcode: barcodeField.value.trim() || null,
    styles: stylesField.value.trim() || null,
    country: countryField.value.trim() || null,
    coverImageUrl: coverImageUrlField.value.trim() || null,
    tracklist: tracklistField.value.trim() || null,
    discogsReleaseId: discogsReleaseIdField.value ? parseInt(discogsReleaseIdField.value, 10) : null,
    label: labelField.value.trim() || null,
    catalogNumber: catalogNumberField.value.trim() || null,
    purchasePrice: purchasePriceField.value ? parseFloat(purchasePriceField.value) : null,
    purchaseDate: purchaseDateField.value || null,
    purchaseSource: purchaseSourceField.value.trim() || null,
  };

  const id = idField.value;
  const targetCollectionId = recordCollectionField.value;
  const targetApiUrl = `/api/collections/${targetCollectionId}/records`;
  const url = id ? `${targetApiUrl}/${id}` : targetApiUrl;
  const method = id ? "PUT" : "POST";

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const wasEdit = !!id;
  resetForm();
  currentCollectionId = targetCollectionId;
  currentView = "collection";
  localStorage.setItem("vinyl-current-collection-id", currentCollectionId);
  dashboardView.hidden = true;
  collectionView.hidden = false;
  await loadCollections();
  showToast(wasEdit ? "Platte aktualisiert" : "Platte hinzugefügt");
});

async function loadWishlist() {
  const res = await fetch("/api/wishlist");
  wishlist = await res.json();
  renderWishlistGrid();
}

function renderWishlistGrid() {
  wishlistGrid.innerHTML = "";
  wishlistEmptyState.hidden = wishlist.length > 0;

  wishlist.forEach(item => {
    const card = document.createElement("div");
    card.className = "wish";
    card.innerHTML = `
      <div class="art${item.coverImageUrl ? " has-image" : ""}"${item.coverImageUrl ? ` style="background-image:url('${item.coverImageUrl}')"` : ""}></div>
      <div class="info">
        <div class="title">${escapeHtml(item.title)}</div>
        <div class="artist">${escapeHtml(item.artist)}</div>
        ${item.lastKnownPrice != null ? `<div class="price">ab ${escapeHtml(formatMoney(item.lastKnownPrice, item.lastKnownPriceCurrency))}</div>` : ""}
      </div>
      <button type="button" class="add" data-id="${item.id}">In Sammlung</button>
      <button type="button" class="rm" data-id="${item.id}" aria-label="${escapeHtml(item.title)} von der Wunschliste entfernen">Entfernen</button>
    `;
    wishlistGrid.appendChild(card);
  });

  wishlistGrid.querySelectorAll(".add").forEach(btn =>
    btn.addEventListener("click", () => openPromoteModal(btn.dataset.id))
  );
  wishlistGrid.querySelectorAll(".rm").forEach(btn =>
    btn.addEventListener("click", () => requestRemoveFromWishlist(btn.dataset.id))
  );
}

function requestRemoveFromWishlist(id) {
  confirmText.textContent = "Diese Platte von der Wunschliste entfernen?";
  confirmAction = async () => {
    await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
    await loadWishlist();
    showToast("Von der Wunschliste entfernt");
  };
  confirmModal.hidden = false;
}

function openPromoteModal(id) {
  promotingWishlistItemId = id;
  const targetable = collections.filter(c => c.deletable);
  if (targetable.length === 0) {
    showToast("Lege zuerst eine Sammlung an", "info");
    return;
  }
  promoteSelect.innerHTML = "";
  targetable.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    promoteSelect.appendChild(opt);
  });
  promoteModal.hidden = false;
}

function closePromoteModal() {
  promoteModal.hidden = true;
  promotingWishlistItemId = null;
}

async function confirmPromoteWishlistItem() {
  const item = wishlist.find(w => String(w.id) === String(promotingWishlistItemId));
  const targetCollectionId = promoteSelect.value;
  if (!item || !targetCollectionId) return;

  await fetch(`/api/collections/${targetCollectionId}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      artist: item.artist,
      title: item.title,
      format: item.format,
      genre: "Sonstiges",
      condition: "Sehr gut+ (VG+)",
      releaseYear: item.releaseYear,
      catalogNumber: item.catalogNumber,
      coverImageUrl: item.coverImageUrl,
      discogsReleaseId: item.discogsReleaseId,
    }),
  });
  await fetch(`/api/wishlist/${item.id}`, { method: "DELETE" });

  closePromoteModal();
  await loadWishlist();
  await loadCollections();
  showToast("Zur Sammlung hinzugefügt");
}

promoteConfirm.addEventListener("click", confirmPromoteWishlistItem);
promoteCancel.addEventListener("click", closePromoteModal);
promoteModal.addEventListener("click", e => {
  if (e.target === promoteModal) closePromoteModal();
});

function openWishlistSearchModal() {
  wishlistSearchModal.hidden = false;
  wishlistSearchInput.value = "";
  wishlistSearchStatus.hidden = true;
  wishlistSearchResults.hidden = true;
  wishlistSearchResults.innerHTML = "";
  wishlistSearchInput.focus();
}

function closeWishlistSearchModal() {
  clearTimeout(wishlistSearchTimer);
  wishlistSearchSeq++;
  wishlistSearchModal.hidden = true;
}

let wishlistSearchTimer = null;
let wishlistSearchSeq = 0;

function scheduleWishlistSearch() {
  clearTimeout(wishlistSearchTimer);
  if (wishlistSearchInput.value.trim().length < LIVE_SEARCH_MIN_CHARS) {
    wishlistSearchSeq++;
    wishlistSearchStatus.hidden = true;
    wishlistSearchResults.hidden = true;
    wishlistSearchResults.innerHTML = "";
    return;
  }
  wishlistSearchTimer = setTimeout(submitWishlistSearch, LIVE_SEARCH_DELAY);
}

async function submitWishlistSearch() {
  clearTimeout(wishlistSearchTimer);
  const query = wishlistSearchInput.value.trim();
  if (!query) return;
  const seq = ++wishlistSearchSeq;

  if (wishlistSearchResults.hidden) {
    wishlistSearchStatus.hidden = false;
    wishlistSearchStatus.textContent = "Suche läuft…";
  }

  try {
    const results = await searchDiscogs(query);
    if (seq !== wishlistSearchSeq) return;

    if (results.length === 0) {
      wishlistSearchResults.hidden = true;
      wishlistSearchResults.innerHTML = "";
      wishlistSearchStatus.hidden = false;
      wishlistSearchStatus.textContent = "Keine Treffer gefunden.";
      return;
    }

    const owned = await getOwnedRecords();
    if (seq !== wishlistSearchSeq) return;
    wishlistSearchResults.innerHTML = "";
    wishlistSearchStatus.hidden = true;
    wishlistSearchResults.hidden = false;
    results.slice(0, 25).forEach(r => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "scan-result-item";
      btn.innerHTML = `
        ${releasePreview(r, owned)}`;
      btn.addEventListener("click", () => addToWishlist(r.id));
      wishlistSearchResults.appendChild(btn);
    });
  } catch (err) {
    if (seq !== wishlistSearchSeq) return;
    wishlistSearchResults.hidden = true;
    wishlistSearchResults.innerHTML = "";
    wishlistSearchStatus.hidden = false;
    wishlistSearchStatus.textContent = "Discogs nicht erreichbar – bitte später erneut versuchen.";
  }
}

async function addToWishlist(releaseId) {
  try {
    const res = await fetch(`/api/wishlist/${releaseId}`, { method: "POST" });
    if (res.status === 409) {
      showToast("Bereits auf der Wunschliste", "info");
      closeWishlistSearchModal();
      return;
    }
    if (!res.ok) throw new Error("Hinzufügen fehlgeschlagen");
    closeWishlistSearchModal();
    await loadWishlist();
    showToast("Zur Wunschliste hinzugefügt");
  } catch (err) {
    showToast("Konnte nicht hinzugefügt werden", "error");
  }
}

wishlistSearchBtn.addEventListener("click", e => { e.preventDefault(); openWishlistSearchModal(); });
wishlistSearchCancel.addEventListener("click", closeWishlistSearchModal);
wishlistSearchModal.addEventListener("click", e => {
  if (e.target === wishlistSearchModal) closeWishlistSearchModal();
});
wishlistSearchSubmit.addEventListener("click", submitWishlistSearch);
wishlistSearchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitWishlistSearch();
  }
});
wishlistSearchInput.addEventListener("input", scheduleWishlistSearch);

cancelBtn.addEventListener("click", resetForm);
searchField.addEventListener("input", renderRecords);

filterToggleBtn.addEventListener("click", () => {
  filterPanel.hidden = !filterPanel.hidden;
  filterToggleBtn.setAttribute("aria-expanded", String(!filterPanel.hidden));
});
[filterGenre, filterFormat, filterCondition, filterCountry, filterYearFrom, filterYearTo].forEach(field =>
  field.addEventListener("input", renderRecords)
);
filterResetBtn.addEventListener("click", () => {
  filterGenre.value = "";
  filterFormat.value = "";
  filterCondition.value = "";
  filterCountry.value = "";
  filterYearFrom.value = "";
  filterYearTo.value = "";
  renderRecords();
});

navOverview.addEventListener("click", () => {
  closeMenu();
  showDashboard();
});
sidebarNewCollection.addEventListener("click", () => {
  closeMenu();
  openCollectionModal();
});
menuBtn.addEventListener("click", () => {
  const open = appShell.classList.toggle("menu-open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
// Klick auf die abgedunkelte Fläche neben der mobilen Seitenleiste schließt sie
appShell.addEventListener("click", e => {
  if (e.target === appShell && appShell.classList.contains("menu-open")) closeMenu();
});

// Escape schließt den obersten offenen Dialog bzw. die mobile Seitenleiste
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!confirmModal.hidden) closeConfirm();
  else if (!detailModal.hidden) closeDetail();
  else if (!scanModal.hidden) closeScanModal();
  else if (!wishlistSearchModal.hidden) closeWishlistSearchModal();
  else if (!promoteModal.hidden) closePromoteModal();
  else if (!collectionModal.hidden) closeCollectionModal();
  else if (appShell.classList.contains("menu-open")) closeMenu();
});

// Discogs-Trefferliste im Kopf schließen, sobald außerhalb geklickt oder Escape gedrückt wird
function closeManualSearchResults() {
  clearTimeout(searchTimer);
  manualSearchResults.innerHTML = "";
  manualSearchStatus.hidden = true;
}
document.addEventListener("click", e => {
  if (!discogsSearch.contains(e.target)) closeManualSearchResults();
});
manualSearchInput.addEventListener("keydown", e => {
  if (e.key === "Escape") closeManualSearchResults();
});

viewGridBtn.addEventListener("click", () => setViewMode("grid"));
viewListBtn.addEventListener("click", () => setViewMode("list"));
refreshPricesBtns.forEach(btn => btn.addEventListener("click", startPriceRefresh));

recordsTable.addEventListener("click", e => {
  const sortBtn = e.target.closest(".sort-btn");
  if (sortBtn) {
    const key = sortBtn.dataset.sort;
    sortDir = key === sortKey ? -sortDir : 1;
    sortKey = key;
    renderRecords();
    recordsTable.querySelector(`.sort-btn[data-sort="${key}"]`).focus();
    return;
  }
  const removeBtn = e.target.closest(".row-rm");
  if (removeBtn) {
    requestDelete(removeBtn.dataset.id);
    return;
  }
  const row = e.target.closest("tr[data-id]");
  if (row) openDetail(row.dataset.id);
});
recordsTable.addEventListener("keydown", e => {
  const row = e.target.closest("tr[data-id]");
  if (!row || e.target !== row || (e.key !== "Enter" && e.key !== " ")) return;
  e.preventDefault();
  openDetail(row.dataset.id);
});

async function loadAccount() {
  try {
    const me = await (await fetch("/api/auth/me")).json();
    if (!me.authenticated) {
      location.replace("/login.html");
      return;
    }
    document.getElementById("account-name").textContent = me.username;
    document.getElementById("account-avatar").textContent = me.username.charAt(0);
  } catch (err) {
    // Anzeige des Namens ist optional; die Daten-Aufrufe leiten bei Bedarf selbst zur Anmeldung
  }
}

document.getElementById("logout-btn").addEventListener("click", async () => {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } finally {
    location.replace("/login.html");
  }
});

loadAccount();
syncViewButtons();
loadCollections();
loadWishlist();
resumePriceRefresh();
