// src/introductions.js
// Renders a grid of introductions with images and excerpts.

export async function renderIntroductionsGrid() {
  const container = document.getElementById('introductions-grid');
  if (!container) return;

  const SECTION_ID = 4964692123039;
  const isSectionPage = window.location.pathname.includes(`/sections/${SECTION_ID}`);
  const perPage = isSectionPage ? 100 : 6;

  const resp = await fetch(
    `/api/v2/help_center/sections/${SECTION_ID}/articles.json?sort_by=created_at&sort_order=desc&per_page=${perPage}`
  );
  const data = await resp.json();
  const articles = Array.isArray(data.articles) ? data.articles : [];

  container.innerHTML = '';
  if (!articles.length) {
    container.innerHTML = '<div class="introductions-empty">No introductions found.</div>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = isSectionPage ? 'introductions-grid-4wide' : 'introductions-grid-3x2';

  articles.forEach(article => {
    const tile = document.createElement('article');
    tile.className = 'intro-item';
    tile.setAttribute('data-article-id', article.id);
    tile.innerHTML = `
      <a href="${article.html_url}">
        <img class="intro-img" src="/assets/image-pending.jpg" alt="Article image" loading="lazy" />
        <h3 class="intro-title">${article.title}</h3>
        <p class="intro-excerpt">Loading preview…</p>
      </a>
    `;
    grid.appendChild(tile);
  });

  container.appendChild(grid);

  const locale =
    (window.HelpCenter && HelpCenter.user && HelpCenter.user.locale) ||
    (function () {
      const m = location.pathname.match(/\/hc\/([^/]+)/);
      return (m && m[1]) || 'en-us';
    })();

  function firstImageSrc(html) {
    const m = html && html.match(/<img[^>]+src=['"]([^'"]+)['"]/i);
    return m ? m[1] : null;
  }

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function truncateWords(text, n) {
    const parts = (text || '').split(/\s+/).filter(Boolean);
    if (parts.length <= n) return text || '';
    return parts.slice(0, n).join(' ') + '…';
  }

  const tiles = grid.querySelectorAll('.intro-item');
  tiles.forEach(tile => {
    const id = tile.getAttribute('data-article-id');
    fetch(`/api/v2/help_center/${locale}/articles/${id}.json`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data || !data.article) return;
        const body = data.article.body || '';
        const imgEl = tile.querySelector('.intro-img');
        const src = firstImageSrc(body) || '/assets/image-pending.jpg';
        if (imgEl) imgEl.src = src;
        const p = tile.querySelector('.intro-excerpt');
        if (p) p.textContent = truncateWords(stripHtml(body), 40) || 'No description available.';
      })
      .catch(() => {});
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderIntroductionsGrid);
} else {
  renderIntroductionsGrid();
}
