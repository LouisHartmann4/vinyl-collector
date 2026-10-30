const form = document.getElementById("auth-form");
const usernameField = document.getElementById("username");
const passwordField = document.getElementById("password");
const errorEl = document.getElementById("auth-error");
const submitBtn = document.getElementById("auth-submit");

// Spring legt das CSRF-Token in ein Cookie; jede schreibende Anfrage schickt es als Header zurück
function csrfToken() {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

async function loadSession() {
  const res = await fetch("/api/auth/me");
  return res.json();
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = !message;
}

async function readError(res, fallback) {
  try {
    const body = await res.json();
    return body.error || fallback;
  } catch (err) {
    return fallback;
  }
}

async function login(username, password) {
  const send = () => fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "X-XSRF-TOKEN": csrfToken() },
    body: new URLSearchParams({ username, password })
  });
  let res = await send();
  if (res.status === 403) {
    // Token abgelaufen (z. B. nach einem Neustart des Servers): neu holen und einmal wiederholen
    await loadSession();
    res = await send();
  }
  return res;
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  showError("");
  if (!form.reportValidity()) return;

  submitBtn.disabled = true;
  submitBtn.classList.add("is-busy");
  try {
    const res = await login(usernameField.value.trim(), passwordField.value);
    if (res.ok) {
      location.replace("/");
      return;
    }
    showError(await readError(res, "Anmeldung fehlgeschlagen."));
    passwordField.select();
  } catch (err) {
    showError("Der Server ist nicht erreichbar. Bitte später erneut versuchen.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("is-busy");
  }
});

(async () => {
  try {
    const session = await loadSession();
    if (session.authenticated) {
      location.replace("/");
      return;
    }
  } catch (err) {
    // ohne Sitzungsinfo bleibt die Anmeldung trotzdem möglich
  }
  usernameField.focus();
})();
