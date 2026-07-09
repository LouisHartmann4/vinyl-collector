const GENRE_ICONS = {
  "Rock": "🎸",
  "Pop": "🎤",
  "Jazz": "🎷",
  "Electronic": "🎛️",
  "Hip-Hop": "🎧",
  "Klassik": "🎻",
  "Soul/Funk": "🕺",
  "Sonstiges": "💿",
};

const form = document.getElementById("record-form");
const formToggle = document.getElementById("form-toggle");
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
const statTotal = document.getElementById("stat-total");
const statArtists = document.getElementById("stat-artists");
const statGenres = document.getElementById("stat-genres");
const confirmModal = document.getElementById("confirm-modal");
const confirmText = document.getElementById("confirm-text");
const confirmOk = document.getElementById("confirm-ok");
const confirmCancel = document.getElementById("confirm-cancel");
const deleteAllBtn = document.getElementById("delete-all-btn");
const toastEl = document.getElementById("toast");
const scanToggle = document.getElementById("scan-toggle");
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

let records = [];
let wishlist = [];
let collections = [];
let currentCollectionId = localStorage.getItem("vinyl-current-collection-id");
let confirmAction = null;
let toastTimer = null;
let html5QrCode = null;
let manualEntryTimer = null;

function recordsApiUrl() {
  return `/api/collections/${currentCollectionId}/records`;
}

async function loadCollections() {
  const res = await fetch("/api/collections");
  collections = await res.json();

  if (!collections.some(c => String(c.id) === String(currentCollectionId))) {
    currentCollectionId = collections[0].id;
  }
  localStorage.setItem("vinyl-current-collection-id", currentCollectionId);

  renderCollectionsGrid();
  renderRecordCollectionOptions();
  await loadRecords();
}

function renderCollectionsGrid() {
  collectionsGrid.innerHTML = "";
  collections.forEach(c => {
    const card = document.createElement("div");
    card.className = "item-card collection-card" + (String(c.id) === String(currentCollectionId) ? " active" : "");
    card.innerHTML = `
      <span class="item-name">${c.deletable ? "💿" : "📚"} ${escapeHtml(c.name)}</span>
      <span class="item-expiry">${c.recordCount} ${c.recordCount === 1 ? "Platte" : "Platten"}</span>
      ${c.deletable ? `<div class="item-actions"><button class="icon-btn delete" data-id="${c.id}" data-name="${escapeHtml(c.name)}" data-count="${c.recordCount}">Löschen</button></div>` : ""}
    `;
    card.addEventListener("click", e => {
      if (e.target.closest("button")) return;
      switchCollection(c.id);
    });
    collectionsGrid.appendChild(card);
  });

  collectionsGrid.querySelectorAll(".delete").forEach(btn =>
    btn.addEventListener("click", () => requestDeleteCollection(btn.dataset.id, btn.dataset.name, btn.dataset.count))
  );
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
  formToggle.disabled = !canAdd;
  scanToggle.disabled = !canAdd;

  if (canAdd) {
    const defaultId = targetable.some(c => String(c.id) === String(currentCollectionId))
      ? currentCollectionId
      : targetable[0].id;
    recordCollectionField.value = defaultId;
  }
}

async function switchCollection(id) {
  currentCollectionId = id;
  localStorage.setItem("vinyl-current-collection-id", currentCollectionId);
  resetForm();
  renderCollectionsGrid();
  renderRecordCollectionOptions();
  await loadRecords();
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
  currentCollectionId = created.id;
  localStorage.setItem("vinyl-current-collection-id", currentCollectionId);
  await loadCollections();
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
  renderCollectionOverview();
}

function renderCollectionOverview() {
  const overview = document.getElementById("collection-overview");
  if (!overview) return;

  if (records.length === 0) {
    overview.innerHTML = `<h3>Übersicht</h3><p class="overview-empty">Noch keine Platten in dieser Sammlung.</p>`;
    return;
  }

  const countryCounts = {};
  records.forEach(r => {
    if (r.country) countryCounts[r.country] = (countryCounts[r.country] || 0) + 1;
  });
  const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0];

  const priced = records.filter(r => r.lastKnownPrice != null);
  const highest = priced.length ? priced.reduce((a, b) => (b.lastKnownPrice > a.lastKnownPrice ? b : a)) : null;
  const lowest = priced.length ? priced.reduce((a, b) => (b.lastKnownPrice < a.lastKnownPrice ? b : a)) : null;
  const avgPrice = priced.length ? priced.reduce((sum, r) => sum + r.lastKnownPrice, 0) / priced.length : null;
  const totalValue = avgPrice != null ? avgPrice * records.length : null;
  const currency = priced.length ? (priced[0].lastKnownPriceCurrency || "") : "";

  overview.innerHTML = `
    <h3>Übersicht</h3>
    <div class="overview-item">
      <span>Anzahl der Platten</span>
      <strong>${records.length}</strong>
    </div>
    <div class="overview-item">
      <span>Häufigstes Land</span>
      <strong>${topCountry ? `${escapeHtml(topCountry[0])} (${topCountry[1]})` : "–"}</strong>
    </div>
    ${highest ? `
    <div class="overview-item">
      <span>Höchster Plattenpreis</span>
      <div class="overview-price-item">
        ${highest.coverImageUrl ? `<img class="overview-price-cover" src="${highest.coverImageUrl}" alt="" loading="lazy">` : ""}
        <strong>${highest.lastKnownPrice.toFixed(2)} ${escapeHtml(highest.lastKnownPriceCurrency || "")}</strong>
      </div>
    </div>` : ""}
    ${lowest ? `
    <div class="overview-item">
      <span>Niedrigster Plattenpreis</span>
      <div class="overview-price-item">
        ${lowest.coverImageUrl ? `<img class="overview-price-cover" src="${lowest.coverImageUrl}" alt="" loading="lazy">` : ""}
        <strong>${lowest.lastKnownPrice.toFixed(2)} ${escapeHtml(lowest.lastKnownPriceCurrency || "")}</strong>
      </div>
    </div>` : ""}
    ${totalValue != null ? `
    <div class="overview-item overview-total">
      <span>Gesamtwert der Sammlung</span>
      <strong>${totalValue.toFixed(2)} ${escapeHtml(currency)}</strong>
    </div>` : `<p class="overview-empty">Noch keine Preisdaten – scanne Platten per Barcode, um Preise zu erfassen.</p>`}
  `;
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

function renderRecords() {
  const query = searchField.value.trim().toLowerCase();
  const filtered = records.filter(r => matchesQuery(r, query) && matchesFilters(r));
  filterToggleBtn.classList.toggle("active", hasActiveFilters());

  statTotal.textContent = records.length;
  statArtists.textContent = new Set(records.map(r => r.artist.trim().toLowerCase())).size;
  statGenres.textContent = new Set(records.map(r => r.genre)).size;

  recordsGrid.innerHTML = "";
  emptyState.hidden = records.length > 0;

  filtered
    .slice()
    .sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title))
    .forEach(record => {
      const card = document.createElement("div");
      card.className = "item-card";

      const icon = GENRE_ICONS[record.genre] || "💿";
      const meta = [record.format, record.releaseYear, record.condition]
        .filter(Boolean)
        .join(" · ");

      card.innerHTML = `
        ${record.coverImageUrl ? `<img class="item-cover" src="${record.coverImageUrl}" alt="" loading="lazy">` : ""}
        <div class="item-top">
          <span class="item-name">${escapeHtml(record.title)}</span>
        </div>
        <span class="record-artist">${escapeHtml(record.artist)}</span>
        <span class="category-badge">${icon} ${escapeHtml(record.genre || "Sonstiges")}</span>
        <span class="item-expiry">${escapeHtml(meta) || "Keine weiteren Angaben"}</span>
        ${record.styles ? `<span class="record-styles">${escapeHtml(record.styles)}</span>` : ""}
        ${record.country ? `<span class="record-styles">${escapeHtml(record.country)}</span>` : ""}
        ${record.notes ? `<span class="record-notes">${escapeHtml(record.notes)}</span>` : ""}
        <div class="item-actions">
          <button class="icon-btn edit" data-id="${record.id}">Bearbeiten</button>
          <button class="icon-btn delete" data-id="${record.id}">Löschen</button>
        </div>
      `;
      card.addEventListener("click", e => {
        if (e.target.closest("button")) return;
        openDetail(record.id);
      });
      recordsGrid.appendChild(card);
    });

  recordsGrid.querySelectorAll(".edit").forEach(btn =>
    btn.addEventListener("click", () => startEdit(btn.dataset.id))
  );
  recordsGrid.querySelectorAll(".delete").forEach(btn =>
    btn.addEventListener("click", () => requestDelete(btn.dataset.id))
  );
}

function closeDetail() {
  detailModal.hidden = true;
  detailContent.innerHTML = "";
}

function metaItem(label, value) {
  if (!value) return "";
  return `<div class="detail-meta-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

function openDetail(id) {
  const record = records.find(r => String(r.id) === String(id));
  if (!record) return;

  const icon = GENRE_ICONS[record.genre] || "💿";

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

  detailContent.innerHTML = `
    <div class="detail-header">
      ${record.coverImageUrl ? `<img class="detail-cover" src="${record.coverImageUrl}" alt="" loading="lazy">` : ""}
      <div class="detail-header-text">
        <h3 class="detail-title">${escapeHtml(record.title)}</h3>
        <p class="detail-artist">${escapeHtml(record.artist)}</p>
        <div class="detail-badges">
          <span class="category-badge">${icon} ${escapeHtml(record.genre || "Sonstiges")}</span>
        </div>
      </div>
    </div>
    ${metaItems ? `<div class="detail-meta-grid">${metaItems}</div>` : ""}
    <div class="detail-body">
      ${record.tracklist ? `<div class="detail-section"><h4>Tracklist</h4><p class="detail-tracklist">${escapeHtml(record.tracklist)}</p></div>` : ""}
      ${record.notes ? `<div class="detail-section"><h4>Notizen</h4><p>${escapeHtml(record.notes)}</p></div>` : ""}
    </div>
    <div class="detail-section detail-market" id="detail-market">
      <h4>Marktwert</h4>
      <p id="detail-market-body">${record.discogsReleaseId ? "Lade…" : "Kein Discogs-Treffer verknüpft (nur bei per Scan hinzugefügten Platten verfügbar)."}</p>
      ${record.discogsReleaseId ? `<button type="button" class="secondary price-analysis-btn" id="price-analysis-btn">Preisanalyse anzeigen</button>
      <div id="price-analysis-result"></div>` : ""}
    </div>
    <div class="detail-actions">
      <button type="button" id="detail-edit-btn">Bearbeiten</button>
      <button type="button" class="secondary" id="detail-delete-btn">Löschen</button>
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
      <span class="detail-market-value">ab ${stats.lowestPrice.toFixed(2)} ${escapeHtml(stats.currency || "")}</span><br>
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
        <span class="price-bar-value">${p.lowestPrice.toFixed(2)} ${escapeHtml(p.currency || "")}</span>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="price-stats">
      <div class="price-stat-card">
        <span class="price-stat-value">${minPrice.toFixed(2)} ${escapeHtml(currency)}</span>
        <span class="price-stat-label">Min</span>
      </div>
      <div class="price-stat-card">
        <span class="price-stat-value">${avgPrice.toFixed(2)} ${escapeHtml(currency)}</span>
        <span class="price-stat-label">Durchschnitt</span>
      </div>
      <div class="price-stat-card">
        <span class="price-stat-value">${maxPrice.toFixed(2)} ${escapeHtml(currency)}</span>
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
    <circle cx="${x(i)}" cy="${y(p.lowestPrice)}" r="${p.owned ? 6 : 4}"
      fill="${p.owned ? "var(--primary-hover)" : "var(--primary)"}" stroke="#fff" stroke-width="2">
      <title>${escapeHtml(p.label)}: ${p.lowestPrice.toFixed(2)} ${escapeHtml(p.currency || "")}</title>
    </circle>
  `).join("");

  const xLabels = sorted.map((p, i) => `
    <text x="${x(i)}" y="${height - 10}" font-size="9.5" text-anchor="middle" fill="var(--muted)"
      transform="rotate(20 ${x(i)} ${height - 10})">${escapeHtml(truncateLabel(p.label))}</text>
  `).join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="price-line-svg" preserveAspectRatio="xMidYMid meet">
      <line x1="${padLeft}" y1="${avgY}" x2="${width - padRight}" y2="${avgY}" stroke="var(--border)" stroke-width="1" />
      <text x="${width - padRight}" y="${avgY - 4}" font-size="10" text-anchor="end" fill="var(--muted)">Ø ${avgPrice.toFixed(2)}</text>
      <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${height - padBottom}" stroke="var(--border)" stroke-width="1" />
      <text x="${padLeft - 6}" y="${y(maxPrice) + 4}" font-size="9.5" text-anchor="end" fill="var(--muted)">${maxPrice.toFixed(0)}</text>
      <text x="${padLeft - 6}" y="${y(minPrice) + 4}" font-size="9.5" text-anchor="end" fill="var(--muted)">${minPrice.toFixed(0)}</text>
      <polyline points="${linePoints}" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
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

function openForm() {
  form.hidden = false;
  formToggle.classList.add("open");
  renderRecordCollectionOptions();
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
  submitBtn.textContent = "Speichern";
  artistField.focus();
}

function resetForm() {
  form.reset();
  idField.value = "";
  barcodeField.value = "";
  discogsReleaseIdField.value = "";
  submitBtn.textContent = "Hinzufügen";
  form.hidden = true;
  formToggle.classList.remove("open");
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

function showToast(message) {
  toastEl.textContent = message;
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
      openForm();
      barcodeField.value = code;
      showToast("Kein Discogs-Treffer gefunden – bitte manuell eingeben");
      return;
    }

    if (results.length === 1) {
      await applyRelease(results[0].id, code);
      return;
    }

    showResultPicker(results, code);
  } catch (err) {
    await closeScanModal();
    openForm();
    barcodeField.value = code;
    showToast("Discogs nicht erreichbar – bitte manuell eingeben");
  }
}

function showResultPicker(results, code) {
  scanStatus.textContent = "Mehrere Treffer gefunden – bitte auswählen:";
  scanResults.hidden = false;
  scanResults.innerHTML = "";
  results.forEach(r => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "scan-result-item";
    btn.innerHTML = `
      <img src="${r.thumb || ""}" alt="">
      <span>
        <span class="scan-result-title">${escapeHtml(r.title)}</span><br>
        <span class="scan-result-year">${r.year || ""}${r.catalogNumber ? ` - ${escapeHtml(r.catalogNumber)}` : ""}</span>
      </span>
    `;
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
    openForm();
    barcodeField.value = code;
    discogsReleaseIdField.value = releaseId;
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
    showToast("Daten von Discogs geladen – bitte prüfen und ergänzen");
    artistField.focus();
  } catch (err) {
    await closeScanModal();
    openForm();
    barcodeField.value = code;
    showToast("Discogs-Daten konnten nicht geladen werden – bitte manuell eingeben");
  }
}

newCollectionBtn.addEventListener("click", openCollectionModal);
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
  localStorage.setItem("vinyl-current-collection-id", currentCollectionId);
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
    const row = document.createElement("div");
    row.className = "wishlist-list-row";
    row.innerHTML = `
      ${item.coverImageUrl ? `<img class="wishlist-list-cover" src="${item.coverImageUrl}" alt="" loading="lazy">` : `<div class="wishlist-list-cover"></div>`}
      <div class="wishlist-list-text">
        <span class="wishlist-list-title">${escapeHtml(item.title)}</span>
        <span class="wishlist-list-artist">${escapeHtml(item.artist)}</span>
        ${item.lastKnownPrice != null ? `<span class="wishlist-list-price">ab ${item.lastKnownPrice.toFixed(2)} ${escapeHtml(item.lastKnownPriceCurrency || "")}</span>` : ""}
      </div>
      <button type="button" class="wishlist-list-remove" data-id="${item.id}" aria-label="Entfernen">✕</button>
    `;
    wishlistGrid.appendChild(row);
  });

  wishlistGrid.querySelectorAll(".wishlist-list-remove").forEach(btn =>
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

function openWishlistSearchModal() {
  wishlistSearchModal.hidden = false;
  wishlistSearchInput.value = "";
  wishlistSearchStatus.hidden = true;
  wishlistSearchResults.hidden = true;
  wishlistSearchResults.innerHTML = "";
  wishlistSearchInput.focus();
}

function closeWishlistSearchModal() {
  wishlistSearchModal.hidden = true;
}

async function submitWishlistSearch() {
  const query = wishlistSearchInput.value.trim();
  if (!query) return;

  wishlistSearchStatus.hidden = false;
  wishlistSearchStatus.textContent = "Suche läuft…";
  wishlistSearchResults.hidden = true;
  wishlistSearchResults.innerHTML = "";

  try {
    const res = await fetch(`/api/discogs/search-text?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Discogs-Suche fehlgeschlagen");
    const results = await res.json();

    if (results.length === 0) {
      wishlistSearchStatus.textContent = "Keine Treffer gefunden.";
      return;
    }

    wishlistSearchStatus.hidden = true;
    wishlistSearchResults.hidden = false;
    results.slice(0, 25).forEach(r => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "scan-result-item";
      btn.innerHTML = `
        <img src="${r.thumb || ""}" alt="">
        <span>
          <span class="scan-result-title">${escapeHtml(r.title)}</span><br>
          <span class="scan-result-year">${r.year || ""}${r.catalogNumber ? ` - ${escapeHtml(r.catalogNumber)}` : ""}</span>
        </span>
      `;
      btn.addEventListener("click", () => addToWishlist(r.id));
      wishlistSearchResults.appendChild(btn);
    });
  } catch (err) {
    wishlistSearchStatus.hidden = false;
    wishlistSearchStatus.textContent = "Discogs nicht erreichbar – bitte später erneut versuchen.";
  }
}

async function addToWishlist(releaseId) {
  try {
    const res = await fetch(`/api/wishlist/${releaseId}`, { method: "POST" });
    if (res.status === 409) {
      showToast("Bereits auf der Wunschliste");
      closeWishlistSearchModal();
      return;
    }
    if (!res.ok) throw new Error("Hinzufügen fehlgeschlagen");
    closeWishlistSearchModal();
    await loadWishlist();
    showToast("Zur Wunschliste hinzugefügt");
  } catch (err) {
    showToast("Konnte nicht hinzugefügt werden");
  }
}

wishlistSearchBtn.addEventListener("click", openWishlistSearchModal);
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

cancelBtn.addEventListener("click", resetForm);
searchField.addEventListener("input", renderRecords);

filterToggleBtn.addEventListener("click", () => {
  filterPanel.hidden = !filterPanel.hidden;
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

loadCollections();
loadWishlist();
