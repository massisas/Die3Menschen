const box = document.getElementById('events');

function formatEvent(e) { // e, lol
  // 'T00:00:00' makes it parse as local time
  // otherwise time zone shifts will cause weird stuff to happen e.g. it's tomorrow in Japan
  const d = new Date(e.event_date + 'T00:00:00');
  const month = d.toLocaleDateString('de-DE', { month: 'short' }).replace('.', '');
  const weekday = d.toLocaleDateString('de-DE', { weekday: 'short' });

  const article = document.createElement('article'); // generates blank event template
  article.className = 'event';
  article.innerHTML = 
 `
    <div class="event-date">
      <span class="ev-month"></span>
      <strong><span class="ev-day"></span><small class="ev-weekday"></small></strong>
      <span class="ev-year"></span>
    </div>
    <div class="event-body">
      <h3></h3>
      <p class="event-time"></p>
      <p class="event-desc"></p>
    </div>
    `;

  // I'm ITSec enough to think about injection
  article.querySelector('.ev-month').textContent = month;
  article.querySelector('.ev-day').textContent = String(d.getDate()).padStart(2, '0');
  article.querySelector('.ev-weekday').textContent = weekday;
  article.querySelector('.ev-year').textContent = d.getFullYear();
  article.querySelector('h3').textContent = e.title;
  article.querySelector('.event-time').textContent =
    e.start_time && e.end_time ? `${e.start_time}–${e.end_time} Uhr` : '';
  article.querySelector('.event-desc').textContent = e.description || '';
  return article;
}

fetch('/api/events')
  .then(res => {                    // Wenn abgekackt
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  })
  .then(events => {                 // Wenn nix da ist
    box.textContent = '';
    if (events.length === 0) {
      box.textContent = 'Zurzeit sind keine Termine geplant.';
      return;
    }
    events.forEach(e => box.appendChild(formatEvent(e)));
  })
  .catch(() => {                  // Wenn Fehler
    box.textContent = 'Die Termine konnten leider nicht geladen werden.';
  });