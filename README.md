# Plant Monitor

A lightweight local dashboard for monitoring plant soil moisture from an ESP32 sensor.

This project uses:
- `Express` for the API and static hosting
- `better-sqlite3` for local data storage (`plants.db`)
- A single-page dashboard in `public/index.html` with Chart.js

## Features

- Receives moisture readings from a sensor device
- Stores timestamped readings in SQLite
- Shows latest reading per plant
- Displays recent moisture history (last 50 readings)
- Visual dashboard with live status, moisture ring, and trend chart
- In-browser journal notes and local photo upload

## Tech Stack

- Node.js
- Express 5
- better-sqlite3
- CORS
- Chart.js (CDN)

## Project Structure

```text
plant-monitor/
  public/
    index.html        # Dashboard UI
  server.js           # API + static server + DB setup
  plants.db           # SQLite database (created on first run)
  package.json
```

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run the server

```bash
node server.js
```

The app will be available at:
- `http://localhost:3000`

## API Endpoints

### `POST /api/sensor`
Accepts sensor readings from ESP32 or other devices.

Request body:

```json
{
  "plant_id": "plant_1",
  "plant_name": "Strawberry",
  "moisture": 57
}
```

Notes:
- `plant_id` is required
- `moisture` is required
- `plant_name` is optional (falls back to `plant_id`)

### `GET /api/plants`
Returns the latest reading for each plant.

Example response:

```json
[
  {
    "plant_id": "plant_1",
    "plant_name": "Strawberry",
    "moisture": 57,
    "last_seen": "2026-04-23 19:35:11"
  }
]
```

### `GET /api/plants/:id/history`
Returns the last 50 readings for a plant, ordered oldest to newest.

## Dashboard Behavior

- Polls every 10 seconds for latest data
- Uses moisture thresholds:
  - `< 30`: needs water
  - `30-59`: getting dry
  - `>= 60`: hydrated
- Updates:
  - circular moisture indicator
  - status badge + alert banner
  - line chart history

## Development Notes

- Database table (`readings`) is auto-created at startup.
- The server hosts static files from `public/`.
- The default frontend currently fetches history for `plant_1`.

## .gitignore

This repo includes a `.gitignore` configured for:
- `node_modules`
- logs
- local env files
- SQLite/local DB files
- common OS/editor artifacts

