# 📡 BaySignal

**A community help board for Tampa Bay.**

Built for HackJam’s **Off the Grid** track, with Hillsborough County as the initial pilot area.

🌐 **[Open the live BaySignal demo](https://baysignal-community.jackykid.chatgpt.site/)**

## 🎯 Project scope

BaySignal gives Tampa Bay residents a place to post online updates and coordinate help during a crisis. Residents can share what’s happening in their area, request help, or offer assistance. Live NOAA weather alerts provide official context, an interactive map helps residents find community posts by ZIP code, and an inbox gathers replies so users can follow up.

## ✨ Features

- 📣 **Community updates** — Post an update, request help, or offer assistance. Open any post to read the full message and reply.
- 🌀 **Live weather alerts** — View Atlantic tropical cyclone information and active Florida weather alerts from NOAA. If a feed is unavailable, BaySignal labels the last saved snapshot.
- 🗺️ **Interactive Tampa Bay map** — Pan and zoom, tap a marker, or enter a ZIP code to filter community posts.
- 📬 **Inbox** — See replies to posts you created in the same browser and open the original conversation to respond. The inbox checks for new replies about every five seconds while open.
- 📻 **News and live radio** — Find links to Spectrum News, Radio Garden’s Tampa stations, BBC News, World Threat Watch, and Bloomberg.
- 🌓 **Light and dark mode** — Switch themes in the top-right corner. BaySignal remembers your choice in that browser.

## 🎬 Judge walkthrough

1. Open **Request help** and publish a test request for ZIP **33620**. Use fictional details because posts and replies are public.
2. Open **Alerts** on another phone or in a private browser window. Tap the **USF Tampa** map marker or enter **33620**, then open the request and reply.
3. Return to **Inbox** in the browser that published the request to see the reply.
4. On **Home**, open **Hurricane Updates** to view NOAA weather feeds and links to news and live radio.

## 💻 Run locally

Install **Node.js 24 or newer**, then open a terminal in the repository folder.

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

When the terminal says **BaySignal is running**, open [http://localhost:4173](http://localhost:4173) on the same computer. Leave the terminal open while using the site.

Local posts and replies are saved in `.local/community.sqlite`, separate from the public demo. To test the inbox locally, publish a request in a regular browser window and reply in a private window.

## 🗂️ Project structure

| Path | Purpose |
| --- | --- |
| `src/` | React pages for alerts, the Tampa Bay map, inbox, profiles, and weather |
| `hosting/` | Web API, weather feed integration, build scripts, and local Node.js server |
| `drizzle/` | SQL migrations for community posts, replies, and weather snapshots |

## 🛠️ Built with

React, Vite, Leaflet, OpenStreetMap, Node.js, SQLite, D1, and weather feeds from NOAA’s National Hurricane Center and National Weather Service.
