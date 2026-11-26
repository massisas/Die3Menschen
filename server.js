const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('tierheim.db', { readonly: false }); // Future-proofing~

// 1. Public folder is public
// Requets are routed into here first & only then go via the API
app.use(express.static('public'));

// 2. API returns events as json
app.get('/api/events', (req, res) => {
  const events = db.prepare(`
    SELECT id, title, event_date, start_time, end_time, description
    FROM events
    WHERE event_date >= date('now')
    ORDER BY event_date, start_time
  `).all();

  res.json(events);
});

// 3. Startet der Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}/home.html`);
});