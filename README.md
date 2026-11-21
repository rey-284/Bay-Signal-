# 📡 BaySignal

**A Tampa Bay community help board with an offline SMS request form.**

Built for HackJam’s **Off the Grid** track, BaySignal helps Hillsborough County residents share local updates, ask for help, and offer assistance during severe weather and internet outages.

🌐 **[Open the live BaySignal demo](https://baysignal-community.jackykid.chatgpt.site/)**

## ✨ Features

- 📣 **Community alerts** — Publish a help request, share an update, or offer help. Open a post to read the full message and reply.
- 🗺️ **Interactive Tampa Bay map** — Pan, zoom, tap an area marker, or enter a ZIP code to filter the alerts feed.
- 📬 **Inbox** — See replies to posts created in the same browser and open the original conversation. The inbox checks for new replies about every five seconds while open.
- 🌀 **Weather updates** — View Atlantic tropical cyclone information and active Florida weather alerts from NOAA. BaySignal saves the latest successful results and labels the saved snapshot if a feed is unavailable.
- 📻 **News and live radio** — Open Spectrum News, Radio Garden’s Tampa stations, BBC News, World Threat Watch, and Bloomberg from the updates page.
- 🌓 **Light and dark mode** — Switch themes in the top-right corner. BaySignal remembers your choice in that browser.
- 📴 **Offline SMS form** — Prepare a structured request offline and send it using your phone’s Messages app when cellular SMS service is available.

## 🎬 Judge walkthrough

1. Open **Request help** and publish a test request for ZIP **33620**. Use fictional details. Posts and replies are public.
2. On another phone or in a private browser window, open **Alerts**. Tap the **USF Tampa** map marker or enter **33620**, open your test request, and reply.
3. Return to **Inbox** in the browser that published the request to see the reply.
4. On **Home**, open **Hurricane Updates** to see the NOAA feeds and additional news and radio links.

## 📴 Offline SMS prototype

1. While connected, open **Request help → Open the offline SMS form** so the browser can cache the page.
2. Turn off Wi-Fi and mobile data while keeping cellular SMS service available, then reopen the form.
3. Enter a test ZIP code, a fictional address, and a request. Tap **Open Messages** and send the text to the shared demo relay number.
4. The relay operator forwards the text manually. The recipient copies it into the offline form’s **Alerts** tab and saves it on their phone.

The sender only needs the relay number. The original Flask dashboard also demonstrates ZIP matching against test subscribers and simulated replies.

## 💻 Run locally

Install **Node.js 24 or newer** and open a terminal in the repository folder.

**Windows PowerShell**

```powershell
npm.cmd ci --include=dev
npm.cmd start
```

**macOS or Linux**

```bash
npm ci --include=dev
npm start
```

When the terminal says **BaySignal is running**, open [http://localhost:4173](http://localhost:4173) on the same computer. Leave the terminal running while you use the site.

Local posts and replies are saved in `.local/community.sqlite`, separate from the live demo’s database. To test the inbox locally, publish a request in a regular browser window and reply in a private window.

## 🗂️ Project structure

| Path | Purpose |
| --- | --- |
| `src/` | React pages for the alerts feed, map, inbox, profiles, and weather |
| `hosting/` | Web API, weather integration, build scripts, and local Node.js server |
| `drizzle/` | SQL migrations for community posts, replies, and weather snapshots |
| `public/mobile/` | Cached SMS request form and alerts saved on the device |
| `backend/app.py` | Original Flask and SQLite relay prototype |

## 🛠️ Built with

React, Vite, Leaflet, OpenStreetMap, Node.js, SQLite, D1, service workers, and NOAA weather feeds.
