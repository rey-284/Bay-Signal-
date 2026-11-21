(function () {
  "use strict";

  const DRAFT_KEY = "baysignal-offline-draft";
  const NUMBER_KEY = "baysignal-relay-number";
  const ALERTS_KEY = "baysignal-saved-alerts";
  const FIELDS = ["zip_code", "street_address", "message"];

  const el = (id) => document.getElementById(id);
  const form = el("request");
  const numberInput = el("relay_number");
  const receivedSms = el("received_sms");

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(readStorage(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function buildText() {
    return [
      "BAYSIGNAL",
      `ZIP: ${el("zip_code").value.trim()}`,
      `ADDRESS: ${el("street_address").value.trim()}`,
      `MESSAGE: ${el("message").value.trim()}`,
    ].join("\n");
  }

  function renderPreview() {
    el("preview").textContent = buildText();
  }

  function saveDraft() {
    const draft = {};
    FIELDS.forEach((field) => {
      draft[field] = el(field).value;
    });

    const draftSaved = writeStorage(DRAFT_KEY, JSON.stringify(draft));
    const numberSaved = writeStorage(NUMBER_KEY, numberInput.value.trim());
    el("saved").textContent = draftSaved && numberSaved
      ? "Draft saved on this phone."
      : "This browser could not save the draft.";
  }

  function loadDraft() {
    const draft = readJson(DRAFT_KEY, {});
    FIELDS.forEach((field) => {
      if (typeof draft[field] === "string") el(field).value = draft[field];
    });
    numberInput.value = readStorage(NUMBER_KEY) || "";
  }

  function checkRequest() {
    let error = "";
    if (!/^\d{5}$/.test(el("zip_code").value.trim())) {
      error = "Enter a 5-digit ZIP code.";
    } else if (!el("street_address").value.trim()) {
      error = "Enter a street address.";
    } else if (!el("message").value.trim()) {
      error = "Describe what you need.";
    }

    el("error").textContent = error;
    return !error;
  }

  function showAlerts(show) {
    form.hidden = show;
    el("alerts_panel").hidden = !show;
    el("show_request").classList.toggle("primary", !show);
    el("show_alerts").classList.toggle("primary", show);
    el("show_request").setAttribute("aria-pressed", String(!show));
    el("show_alerts").setAttribute("aria-pressed", String(show));
  }

  function getAlerts() {
    const alerts = readJson(ALERTS_KEY, []);
    return Array.isArray(alerts) ? alerts : [];
  }

  function renderAlerts() {
    const alerts = getAlerts();
    const list = el("saved_alerts");
    list.replaceChildren();
    el("empty_alerts").hidden = alerts.length > 0;

    alerts.forEach((alert) => {
      const card = document.createElement("article");
      card.className = "preview";

      const heading = document.createElement("strong");
      heading.textContent = `ZIP ${alert.zipCode}`;

      const message = document.createElement("div");
      message.textContent = alert.message;

      const savedAt = document.createElement("small");
      savedAt.textContent = `Saved ${new Date(alert.savedAt).toLocaleString()}`;

      card.append(heading, message, savedAt);
      list.appendChild(card);
    });
  }

  form.addEventListener("submit", (event) => event.preventDefault());

  form.addEventListener("input", () => {
    el("error").textContent = "";
    renderPreview();
    saveDraft();
  });

  el("open_messages").addEventListener("click", () => {
    if (!checkRequest()) return;

    const number = numberInput.value.replace(/[^\d+]/g, "");
    if (!/^\+?\d{7,15}$/.test(number)) {
      el("error").textContent = "Enter the relay phone number.";
      return;
    }

    saveDraft();
    window.location.href = `sms:${number}?body=${encodeURIComponent(buildText())}`;
  });

  el("copy_message").addEventListener("click", async () => {
    if (!checkRequest()) return;
    saveDraft();

    try {
      await navigator.clipboard.writeText(buildText());
      el("saved").textContent = "Message copied.";
    } catch {
      el("saved").textContent = "Copy the text manually from the preview above.";
    }
  });

  el("clear").addEventListener("click", () => {
    FIELDS.forEach((field) => {
      el(field).value = "";
    });
    el("error").textContent = "";
    renderPreview();
    saveDraft();
  });

  el("show_request").addEventListener("click", () => showAlerts(false));
  el("show_alerts").addEventListener("click", () => showAlerts(true));

  el("import_alert").addEventListener("submit", (event) => {
    event.preventDefault();

    const match = receivedSms.value.trim().match(
      /^BAYSIGNAL\r?\nZIP:[ \t]*(\d{5})\r?\nADDRESS:[ \t]*([^\r\n]+)\r?\nMESSAGE:[ \t]*([\s\S]+)$/,
    );

    if (!match || !match[2].trim() || !match[3].trim()) {
      el("alert_status").textContent =
        "Paste the full text, including BAYSIGNAL, ZIP, ADDRESS, and MESSAGE.";
      return;
    }

    const alert = {
      zipCode: match[1],
      message: match[3].trim(),
      savedAt: new Date().toISOString(),
    };

    if (!writeStorage(ALERTS_KEY, JSON.stringify([alert, ...getAlerts()]))) {
      el("alert_status").textContent = "This browser could not save the alert.";
      return;
    }

    receivedSms.value = "";
    renderAlerts();
    el("alert_status").textContent = "Alert saved on this phone.";
  });

  function updateNet() {
    const online = navigator.onLine;
    el("net").textContent = online ? "● Online" : "● Offline";
    el("net").className = online ? "net online" : "net offline";
  }

  window.addEventListener("online", updateNet);
  window.addEventListener("offline", updateNet);

  loadDraft();
  renderPreview();
  renderAlerts();
  updateNet();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
      el("saved").textContent = "Offline setup failed. Reload this page while online.";
    });
  }
})();