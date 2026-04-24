const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new Database('plants.db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up database table
db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id TEXT NOT NULL,
    plant_name TEXT NOT NULL,
    moisture INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ESP32 posts sensor data here
app.post('/api/sensor', (req, res) => {
  const { plant_id, plant_name, moisture } = req.body;
  if (!plant_id || moisture === undefined) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  db.prepare(
    'INSERT INTO readings (plant_id, plant_name, moisture) VALUES (?, ?, ?)'
  ).run(plant_id, plant_name || plant_id, moisture);
  console.log(`[${new Date().toLocaleTimeString()}] ${plant_name}: moisture=${moisture}`);
  res.json({ ok: true });
});

// Dashboard fetches all plants + latest reading each
app.get('/api/plants', (req, res) => {
  const plants = db.prepare(`
    SELECT plant_id, plant_name,
           moisture,
           timestamp as last_seen
    FROM readings
    WHERE id IN (
      SELECT MAX(id) FROM readings GROUP BY plant_id
    )
    ORDER BY plant_name
  `).all();
  res.json(plants);
});

// History for a single plant (last 50 readings)
app.get('/api/plants/:id/history', (req, res) => {
  const rows = db.prepare(
    'SELECT moisture, timestamp FROM readings WHERE plant_id = ? ORDER BY id DESC LIMIT 50'
  ).all(req.params.id);
  res.json(rows.reverse());
});

app.listen(3000, () => {
  console.log('Plant monitor running at http://localhost:3000');
});