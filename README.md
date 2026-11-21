# 📡 BaySignal

**Neighbor-to-neighbor emergency help that still works when the internet doesn't.**

BaySignal is a three-hour HackJam prototype for a Hillsborough County pilot, built for the **Off the Grid** track. Someone without Wi-Fi or mobile data opens a cached offline form, drafts a help request, and sends it as a regular SMS. BaySignal matches the request to opted-in neighbors in the same ZIP code and tracks it on a live dashboard until someone responds.

---

## ✨ How It Works

```
┌──────────────────┐    SMS     ┌──────────────────┐   paste    ┌──────────────────┐
│  Offline form    │ ─────────▶ │  Receiving phone │ ─────────▶ │  Dashboard       │
│  (cached PWA,    │  (cellular │                  │            │  "Load test      │
│   no data/Wi-Fi) │   only)    │                  │            │   alert"         │
└──────────────────┘            └──────────────────┘            └────────┬─────────┘
                                                                         │
                                                                         ▼
                                                               ┌──────────────────┐
                                                               │  Flask relay     │
                                                               │  • saves alert   │
                                                               │  • matches ZIP   │
                                                               │  • records reply │
                                                               └──────────────────┘
```

1. **Draft offline.** The mobile form loads from a service-worker cache, even with Wi-Fi and mobile data turned off.
2. **Send by SMS.** *Open Messages* or *Copy message* hands the request to the phone's regular texting app.
3. **Route by ZIP.** The relay saves the alert as `waiting` and selects opted-in test subscribers in the same ZIP, excluding the requester.
4. **Respond.** A notified neighbor replies, and the dashboard changes from **Waiting for a reply** to **Neighbor responded**.

---

## 🗂️ Project Structure

```
baysignal/
├── app.py              # Flask relay + SQLite (serves the API and the dashboard)
├── requirements.txt    # Python dependencies
├── dashboard.html      # Demo dashboard (alert list + demo controls)
├── mobile/
│   ├── index.html      # Offline request form
│   └── sw.js           # Service worker that caches page assets
├── .gitignore          # Excludes .venv/ and the local database
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Git and VS Code
- A phone with SMS to test the offline form

### Install and run

```bash
git clone <repo-clone-url>
```

```bash
cd baysignal
```

```bash
python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows
.venv\Scripts\activate
```

```bash
# macOS / Linux
source .venv/bin/activate
```

```bash
pip install -r requirements.txt
```

```bash
python app.py
```

Open the dashboard from the Flask app in your browser. The mobile form must be loaded **over HTTPS once** so the service worker can cache it for offline use.

---

## 🔌 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/alerts` | Save an alert as `waiting` and select opted-in test subscribers in the same ZIP, excluding the requester. |
| `GET` | `/api/alerts` | List alerts using public fields only: `alert_id`, `zip_code`, `message`, `status`. |
| `POST` | `/api/alerts/<id>/reply` | Accept a notified subscriber's test ID, record the simulated reply, and set status to `responded`. Rejects replies from subscribers outside the alert's ZIP. |

### Shared fields

| Field | Used in | Public? |
|-------|---------|---------|
| `zip_code` | form, relay, dashboard | ✅ |
| `street_address` | form, relay | ❌ never shown on the dashboard |
| `message` | form, relay, dashboard | ✅ |

### Sample alert

| Field | Value |
|-------|-------|
| ZIP | `33620` |
| Street address | `123 Demo Lane` |
| Message | `TEST: Need a phone charger.` |

One fictional subscriber is seeded in each of the two pilot ZIP codes.

---

## 🔒 Privacy & Safety

- The public dashboard shows **only** `alert_id`, `zip_code`, `message`, and `status`.
- Street addresses, real phone numbers, and credentials are **never** shown in public views or committed to Git.
- Submitted messages are rendered as **plain text** on the dashboard (no HTML injection).
- The local SQLite database and `.venv/` are listed in `.gitignore`.

---

## 👥 Team

| Member | Role | Branch | Owns |
|--------|------|--------|------|
| **Reyanna** | Backend & integration | `reyanna/backend` | `app.py`, SQLite, alert routing, reply handling, `requirements.txt`, final merge |
| **Kayla** | Offline form | `kayla/offline-form` | `mobile/index.html`, `mobile/sw.js`, local drafts, SMS handoff |
| **Annika** | Dashboard | `annika/dashboard` | `dashboard.html`, alert list, *Load test alert* and *Simulate reply* controls |

---

## ⏱️ Build Timeline (3 hours)

| Minutes | Phase | What happens |
|---------|-------|--------------|
| 0–15 | **Setup** | Create the repo, clone, make branches, agree on the sample alert and shared fields. |
| 15–75 | **Build in parallel** | Backend, offline form, and dashboard are built on separate branches. |
| 75–120 | **Integrate** | Merge branches, serve the dashboard from Flask, wire the demo controls to the API. |
| 120–145 | **Rehearse** | Run the full demo twice with both phones and the laptop. |
| 145–160 | **Fix** | Fix anything that breaks the demo; prepare the SMS fallback. |
| 160–180 | **Submit** | Rehearse the pitch, document frameworks and AI assistance, submit under *Off the Grid*. |

---

## 🌿 Git Workflow

Create your branch after cloning:

```bash
git switch -c <your-name>/<feature>
```

Stage, commit, and push only your own files:

```bash
git add <your-files>
```

```bash
git commit -m "Describe your change"
```

```bash
git push -u origin <your-name>/<feature>
```

Then open a **pull request into `main`**. Around minute 75, Reyanna reviews and merges the PRs. Afterward, everyone updates their local `main`:

```bash
git switch main
```

```bash
git pull
```

---

## 🧪 Test Checklist

Run these in order before the demo:

- [ ] **Load a sample alert.** The alert appears on the dashboard with status *Waiting for a reply*.
- [ ] **Verify the ZIP match.** Only the subscriber in the alert's ZIP is selected.
- [ ] **Simulate a reply.** The status changes to *Neighbor responded*; a reply from outside the ZIP is rejected.
- [ ] **Rehearse the real SMS.** With Wi-Fi and mobile data off, the cached form opens and the text arrives.
- [ ] **Practice the manual handoff.** The received text is pasted into the dashboard and parsed into ZIP, address, and message.

---

## 🎤 Demo Script

1. Reyanna turns off Wi-Fi and mobile data (cellular stays on), opens the cached form, drafts the test request, and sends a regular SMS to Kayla.
2. Kayla shows the received text and pastes it into the dashboard.
3. Annika clicks **Load test alert** and shows the matching ZIP and *waiting* status.
4. Annika clicks **Simulate reply** while Reyanna explains the routing. The board shows **Neighbor responded**.

> "That first text was real. Kayla pasted it into the prototype. BaySignal matched the ZIP code and updated the dashboard live. The outgoing texts to test neighbors and their replies were simulated."

**Fallback:** If SMS fails at the venue, show the offline draft, paste the sample message into the dashboard, and tell the judges the SMS was simulated in that run.

---

## 🛣️ Roadmap

Ideas beyond the hackathon prototype:

### 🙋 Volunteer profiles & available supplies
- Users add the kinds of help they can offer to their profile.
- Users list supplies they have on hand, such as first aid kits and other emergency essentials.
- Others can see who has specific supplies or can offer assistance.

### 🔍 Search & filter alerts
- A search bar to filter alerts by location.
- Search by ZIP code or area to find alerts relevant to you.

### 🌀 Live hurricane updates
- Display live hurricane updates and current storm status.
- Show whether a hurricane is **approaching**, **currently affecting** an area, or **has passed**.

---

## 🛠️ Built With

- [Flask](https://flask.palletsprojects.com/) – backend relay and API
- [SQLite](https://www.sqlite.org/) – local alert and subscriber storage
- HTML, CSS, JavaScript – dashboard and offline form
- Service Workers – offline caching

*Frameworks and AI assistance used during the build are documented as part of the hackathon submission.*
