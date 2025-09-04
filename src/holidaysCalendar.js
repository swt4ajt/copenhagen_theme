// Uniken Holidays Calendar Component
// Usage: Call renderHolidaysCalendar(targetSelector)

function extractHolidaysFromArticle(articleSelector) {
  const holidaysData = {};
  const article = document.querySelector(articleSelector);
  if (!article) return holidaysData;
  const sections = article.querySelectorAll('section');
  sections.forEach(section => {
    const region = section.id.replace('-2025', '').toUpperCase();
    const rows = section.querySelectorAll('table tbody tr');
    const holidays = [];
    rows.forEach(row => {
      const dateEl = row.querySelector('time');
      const nameEl = row.querySelector('td:last-child');
      if (dateEl && nameEl) {
        holidays.push({
          date: dateEl.getAttribute('datetime'),
          name: nameEl.textContent.trim()
        });
      }
    });
    holidaysData[region] = holidays;
  });
  return holidaysData;
}

function groupConsecutiveHolidays(holidays) {
  // Group holidays that are on consecutive days
  const grouped = [];
  let temp = [];
  for (let i = 0; i < holidays.length; i++) {
    const curr = holidays[i];
    const prev = holidays[i - 1];
    if (
      prev &&
      (new Date(curr.date) - new Date(prev.date)) / (1000 * 60 * 60 * 24) === 1
    ) {
      if (temp.length === 0) temp.push(prev);
      temp.push(curr);
    } else {
      if (temp.length > 0) {
        grouped.push([...temp]);
        temp = [];
      }
      grouped.push([curr]);
    }
  }
  if (temp.length > 0) grouped.push([...temp]);
  return grouped;
}

function renderHolidaysCalendar(targetSelector, articleSelector = '.pending-holidays-2025') {
  const container = document.querySelector(targetSelector);
  if (!container) return;
  container.innerHTML = '';

  const holidaysData = extractHolidaysFromArticle(articleSelector);
  if (!Object.keys(holidaysData).length) {
    container.innerHTML = '<p>No holiday data found.</p>';
    return;
  }

  // Region navigation
  const nav = document.createElement('nav');
  nav.className = 'holidays-calendar-nav';
  nav.setAttribute('aria-label', 'Regions');
  const ul = document.createElement('ul');
  Object.keys(holidaysData).forEach(region => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#${region}-2025">${region}</a>`;
    ul.appendChild(li);
  });
  nav.appendChild(ul);
  container.appendChild(nav);

  // Region sections
  Object.entries(holidaysData).forEach(([region, holidays]) => {
    const section = document.createElement('section');
    section.className = 'holidays-calendar-region';
    section.id = `${region}-2025`;
    section.innerHTML = `<h2>${region} Holidays – 2025</h2>`;
    const grouped = groupConsecutiveHolidays(holidays);
    const grid = document.createElement('div');
    grid.className = 'holidays-calendar-grid';
    grouped.forEach(group => {
      const tile = document.createElement('div');
      tile.className = 'holidays-calendar-tile';
      if (group.length > 1) {
        tile.innerHTML = `<div class="holidays-calendar-dates">${group
          .map(h => `<span>${new Date(h.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>`)
          .join(' & ')}</div><div class="holidays-calendar-names">${group.map(h => h.name).join(' & ')}</div>`;
      } else {
        const h = group[0];
        tile.innerHTML = `<div class="holidays-calendar-dates">${new Date(h.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div><div class="holidays-calendar-names">${h.name}</div>`;
      }
      grid.appendChild(tile);
    });
    section.appendChild(grid);
    container.appendChild(section);
  });
}

function getUpcomingHolidays(articleSelector = '.pending-holidays-2025') {
  const holidaysData = extractHolidaysFromArticle(articleSelector);
  const today = new Date();
  const upcoming = [];
  Object.entries(holidaysData).forEach(([region, holidays]) => {
    const next = holidays.find(h => new Date(h.date) >= today);
    if (next) {
      upcoming.push({ region, ...next });
    }
  });
  // Sort by soonest date
  upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
  return upcoming;
}

function renderHolidaysBanner(targetSelector, articleSelector = '.pending-holidays-2025', autoSlide = true) {
  const container = document.querySelector(targetSelector);
  if (!container) return;
  container.innerHTML = '';
  const upcoming = getUpcomingHolidays(articleSelector);
  if (!upcoming.length) return;

  const banner = document.createElement('div');
  banner.className = 'holidays-banner';

  if (upcoming.length === 1 || !autoSlide) {
    const h = upcoming[0];
    banner.innerHTML = `<span class="holidays-banner-msg">Upcoming holiday <strong>${h.name}</strong> in <strong>${h.region}</strong> on <strong>${new Date(h.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</strong>. <a href="#holidays-calendar">See full list</a></span>`;
  } else {
    // Multiple, show as slider
    banner.innerHTML = `<div class="holidays-banner-slider">${upcoming.map((h, i) => `<span class="holidays-banner-msg" data-index="${i}" style="display:${i === 0 ? 'inline' : 'none'}">Upcoming holiday <strong>${h.name}</strong> in <strong>${h.region}</strong> on <strong>${new Date(h.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</strong>. <a href="#holidays-calendar">See full list</a></span>`).join('')}</div>`;
    // Auto-slide logic
    let idx = 0;
    setInterval(() => {
      const msgs = banner.querySelectorAll('.holidays-banner-msg');
      msgs.forEach((msg, i) => msg.style.display = i === idx ? 'inline' : 'none');
      idx = (idx + 1) % msgs.length;
    }, 3500);
  }
  container.appendChild(banner);
}

window.renderHolidaysCalendar = renderHolidaysCalendar;
