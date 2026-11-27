const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('tierheim.db', { readonly: false }); // Future-proofing~

db.exec(`
  CREATE TABLE IF NOT EXISTS anfragen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tierart TEXT, tiername TEXT, erwartungen TEXT,
    vorname TEXT NOT NULL, nachname TEXT NOT NULL, altersgruppe TEXT NOT NULL,
    telefon TEXT NOT NULL, email TEXT NOT NULL,
    bundesland TEXT NOT NULL, adresse TEXT, plz TEXT, ort TEXT, beruf TEXT,
    umgebung TEXT NOT NULL, wohnen TEXT NOT NULL, vermieter TEXT,
    garten TEXT, personen INTEGER NOT NULL, kinder INTEGER NOT NULL,
    alterkinder TEXT, vorbesitz TEXT,
    unterbringung TEXT NOT NULL, alleine TEXT NOT NULL,
    haustiere TEXT NOT NULL, kastriert TEXT NOT NULL, urlaub TEXT,
    erstellt_am TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
const PFLICHT = ['vorname','nachname','altersgruppe','telefon','email','bundesland',
  'umgebung','wohnen','unterbringung','alleine','haustiere','kastriert'];
const OPTIONAL = ['tierart','tiername','erwartungen','adresse','plz','ort','beruf',
  'vermieter','garten','alterkinder','vorbesitz','urlaub'];
const ZAHLEN = ['personen','kinder'];
const SPALTEN = [...PFLICHT, ...OPTIONAL, ...ZAHLEN];

const insertAnfrage = db.prepare(
  `INSERT INTO anfragen (${SPALTEN.join(',')})
   VALUES (${SPALTEN.map(s => '@' + s).join(',')})`
);


// 1. Public folder is public
// Requets are routed into here first & only then go via the API
app.use(express.static('public'));
app.use(express.json());

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

app.post('/api/anfragen', (req, res) => {
  const b = req.body ?? {};
  const s = v => (typeof v === 'string' ? v.trim().slice(0, 2000) : '');

  const row = {};
  for (const k of [...PFLICHT, ...OPTIONAL]) row[k] = s(b[k]);
  row.altersgruppe = s(b.alter);   // das Formularfeld heißt "alter"
  for (const k of ZAHLEN) row[k] = Number.parseInt(b[k], 10);

  if (PFLICHT.some(k => !row[k]) ||
      ZAHLEN.some(k => !Number.isInteger(row[k]) || row[k] < 0) ||
      !/^\S+@\S+\.\S+$/.test(row.email) ||
      b.einverstaendnis !== true) {
    return res.status(400).json({ error: 'Ungültige Eingabe' });
  }

  insertAnfrage.run(row);
  res.status(201).json({ ok: true });
});


// 3. Startet der Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}/home.html`);
});
