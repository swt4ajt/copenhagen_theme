// src/introductions.js
// Fetches and renders a 3x2 grid of introductions on the homepage

export async function renderIntroductionsGrid() {
  // Only run on the homepage
  if (!document.body.classList.contains('home-page')) return;

  const container = document.getElementById('introductions-grid');
  if (!container) return;

  const SECTION_ID = 4964692123039;
  const resp = await fetch(
    `/api/v2/help_center/sections/${SECTION_ID}/articles.json?sort_by=created_at&sort_order=desc&per_page=6`
  );
  const data = await resp.json();
  const articles = Array.isArray(data.articles) ? data.articles : [];

  container.innerHTML = '';
  if (!articles.length) {
    container.innerHTML = '<div class="introductions-empty">No introductions found.</div>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'introductions-grid-3x2';

  articles.forEach(article => {
    const tile = document.createElement('div');
    tile.className = 'introduction-tile';
    tile.innerHTML = `
      <a href="${article.html_url}" class="introduction-tile-link">
        <div class="introduction-tile-title">${article.title}</div>
        <div class="introduction-tile-date">${new Date(article.created_at).toLocaleDateString()}</div>
      </a>
    `;
    grid.appendChild(tile);
  });

  container.appendChild(grid);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderIntroductionsGrid);
} else {
  renderIntroductionsGrid();
}
