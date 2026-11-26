
// This is our seed js, it produces the db using sqlite
// You oughtn't need the db file itself, as this will just remake it each time

const Database = require('better-sqlite3');
const db = new Database('tierheim.db');

// Yeet the drop table if we're not remaking it regularly

db.exec(`
  DROP TABLE IF EXISTS events;
  CREATE TABLE events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    event_date  TEXT NOT NULL,
    start_time  TEXT,
    end_time    TEXT,
    description TEXT
  );
`);

// Insert current placeholder data into the db

const events = [
  {
    title: 'Valentinstag Kuchen und Kaffee',
    event_date: '2027-02-14',
    start_time: '14:00',
    end_time: '18:00',
    description:
      'Valentinstag bei uns im Tierheim\n' +
      'Genießen Sie am Valentinstag einen gemütlichen Nachmittag mit Kaffee und hausgemachtem Kuchen.\n' +
      'Lernen Sie dabei unser Tierheim und unsere Schützlinge kennen und verbringen Sie ein paar schöne Stunden in herzlicher Atmosphäre.'
  },
  {
    title: 'Osterflohmarkt',
    event_date: '2027-03-26',
    start_time: '13:00',
    end_time: '16:00',
    description:
      'Osterflohmarkt im Tierheim\n' +
      'Besuchen Sie unseren Osterflohmarkt und stöbern Sie durch viele schöne Fundstücke, Dekoartikel und kleine Schätze.\n' +
      'Bei Kaffee und Kuchen können Sie eine gemütliche Zeit verbringen und gleichzeitig unsere Tiere und das Tierheim unterstützen.'
  },
  {
    title: 'Nikolausfest',
    event_date: '2027-12-06',
    start_time: '12:00',
    end_time: '19:00',
    description:
      'Nikolausnachmittag im Tierheim\n' +
      'Feiern Sie mit uns die Adventszeit bei Kaffee, Punsch und weihnachtlichem Gebäck.\n' +
      'In gemütlicher Stimmung können Sie unsere Tiere besuchen, sich austauschen und gemeinsam einen besinnlichen Nikolausnachmittag verbringen.'
  }
];

const insert = db.prepare(`
  INSERT INTO events (title, event_date, start_time, end_time, description)
  VALUES (@title, @event_date, @start_time, @end_time, @description)
`);

const insertAll = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

insertAll(events);

console.log(`Seeded ${db.prepare('SELECT COUNT(*) AS n FROM events').get().n} events.`);
db.close();