// BaySignal offline request form.
// Drafts are saved on this phone only (localStorage). Nothing is sent to a server;
// the request leaves the phone as a regular SMS.

(function () {
  "use strict";

  var DRAFT_KEY = "baysignal-offline-draft";
  var NUMBER_KEY = "baysignal-relay-number";
  var FIELDS = ["zip_code", "street_address", "message"];

  var form = document.getElementById("request");
  var preview = document.getElementById("preview");
  var errorEl = document.getElementById("error");
  var savedEl = document.getElementById("saved");
  var netEl = document.getElementById("net");
  var numberEl = document.getElementById("relay_number");

  function el(id) { return document.getElementById(id); }

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }
  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  // Agreed demo text format. The dashboard's "Load test alert" parses these three labels.
  function buildText() {
    return (
      "BAYSIGNAL\n" +
      "ZIP: " + el("zip_code").value.trim() + "\n" +
      "ADDRESS: " + el("street_address").value.trim() + "\n" +
      "MESSAGE: " + el("message").value.trim()
    );
  }

  function validate() {
    var zip = el("zip_code").value.trim();
    if (!/^\d{5}$/.test(zip)) return "Enter a 5-digit ZIP code.";
    if (!el("street_address").value.trim()) return "Enter a street address.";
    if (!el("message").value.trim()) return "Describe what you need.";
    return "";
  }

  function render() {
    preview.textContent = buildText();
  }

  function saveDraft() {
    var draft = {};
    FIELDS.forEach(function (f) { draft[f] = el(f).value; });
    var ok = safeSet(DRAFT_KEY, JSON.stringify(draft));
    safeSet(NUMBER_KEY, numberEl.value.trim());
    savedEl.textContent = ok ? "Draft saved on this phone." : "";
  }

  function loadDraft() {
    var raw = safeGet(DRAFT_KEY);
    if (raw) {
      try {
        var draft = JSON.parse(raw);
        FIELDS.forEach(function (f) { if (typeof draft[f] === "string") el(f).value = draft[f]; });
        savedEl.textContent = "Draft restored.";
      } catch (e) { /* ignore a corrupt draft */ }
    }
    numberEl.value = safeGet(NUMBER_KEY) || "";
  }

  function checkOrShowError() {
    var problem = validate();
    errorEl.textContent = problem;
    return !problem;
  }

  el("open_messages").addEventListener("click", function () {
    if (!checkOrShowError()) return;
    saveDraft();
    var number = numberEl.value.replace(/[^\d+]/g, "");
    window.location.href = "sms:" + number + "?body=" + encodeURIComponent(buildText());
  });

  el("copy_message").addEventListener("click", function () {
    if (!checkOrShowError()) return;
    saveDraft();
    var text = buildText();
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); savedEl.textContent = "Message copied."; }
      catch (e) { savedEl.textContent = "Copy failed — select the text above."; }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        function () { savedEl.textContent = "Message copied."; },
        fallback
      );
    } else {
      fallback();
    }
  });

  el("clear").addEventListener("click", function () {
    FIELDS.forEach(function (f) { el(f).value = ""; });
    safeRemove(DRAFT_KEY);
    errorEl.textContent = "";
    savedEl.textContent = "Draft cleared.";
    render();
  });

  form.addEventListener("input", function () {
    errorEl.textContent = "";
    render();
    saveDraft();
  });

  function updateNet() {
    if (navigator.onLine) {
      netEl.textContent = "● Online";
      netEl.className = "net online";
    } else {
      netEl.textContent = "● Offline — you can still draft and text";
      netEl.className = "net offline";
    }
  }
  window.addEventListener("online", updateNet);
  window.addEventListener("offline", updateNet);

  loadDraft();
  render();
  updateNet();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(function () {
      /* Needs HTTPS or localhost; the form still works online without it. */
    });
  }
})();
