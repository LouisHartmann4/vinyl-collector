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
const artistField = document.getElementById("artist");
const titleField = document.getElementById("title");
const genreField = document.getElementById("genre");
const releaseYearField = document.getElementById("releaseYear");
const formatField = document.getElementById("format");
const conditionField = document.getElementById("condition");
const notesField = document.getElementById("notes");
const stylesField = document.getElementById("styles");
const countryField = document.getElementById("country");
const coverImageUrlField = document.getElementById("coverImageUrl");
const tracklistField = document.getElementById("tracklist");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const recordsGrid = document.getElementById("records-grid");
const emptyState = document.getElementById("empty-state");
const searchField = document.getElementById("search");
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
const collectionsGrid = document.getElementById("collections-grid");
const recordCollectionField = document.getElementById("record-collection");
const noTargetCollectionHint = document.getElementById("no-target-collection-hint");
const newCollectionBtn = document.getElementById("new-collection-btn");
const collectionModal = document.getElementById("collection-modal");
const collectionNameInput = document.getElementById("collection-name-input");
const collectionCancel = document.getElementById("collection-cancel");
const collectionCreate = document.getElementById("collection-create");

let records = [];
let collections = [];
let currentCollectionId = localStorage.getItem("vinyl-current-collection-id");
let confirmAction = null;
let toastTimer = null;
let html5QrCode = null;

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
}

function renderRecords() {
  const query = searchField.value.trim().toLowerCase();
  const filtered = records.filter(r =>
    r.artist.toLowerCase().includes(query) || r.title.toLowerCase().includes(query)
  );

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
      recordsGrid.appendChild(card);
    });

  recordsGrid.querySelectorAll(".edit").forEach(btn =>
    btn.addEventListener("click", () => startEdit(btn.dataset.id))
  );
  recordsGrid.querySelectorAll(".delete").forEach(btn =>
    btn.addEventListener("click", () => requestDelete(btn.dataset.id))
  );
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
  artistField.value = record.artist;
  titleField.value = record.title;
  genreField.value = record.genre;
  releaseYearField.value = record.releaseYear || "";
  formatField.value = record.format;
  conditionField.value = record.condition;
  notesField.value = record.notes || "";
  stylesField.value = record.styles || "";
  countryField.value = record.country || "";
  coverImageUrlField.value = record.coverImageUrl || "";
  tracklistField.value = record.tracklist || "";
  submitBtn.textContent = "Speichern";
  artistField.focus();
}

function resetForm() {
  form.reset();
  idField.value = "";
  barcodeField.value = "";
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
  await startScan();
}

async function closeScanModal() {
  await stopScan();
  scanModal.hidden = true;
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
  } catch (err) {
    scanStatus.textContent = "Kamera konnte nicht gestartet werden. Bitte Berechtigung prüfen oder manuell eingeben.";
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

async function onScanSuccess(decodedText) {
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
        <span class="scan-result-year">${r.year || ""}</span>
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
    artistField.value = release.artist || "";
    titleField.value = release.title || "";
    genreField.value = matchOption(genreField, release.genre);
    releaseYearField.value = release.releaseYear || "";
    formatField.value = matchOption(formatField, release.format);
    stylesField.value = release.styles || "";
    countryField.value = release.country || "";
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

cancelBtn.addEventListener("click", resetForm);
searchField.addEventListener("input", renderRecords);

loadCollections();
