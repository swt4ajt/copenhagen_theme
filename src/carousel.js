// Carousel module: fetches and renders tiles based on theme setting

export async function renderCarousel(settings) {
  const container = document.getElementById('homepage-carousel');
  if (!container) return;

  const tileCount = settings.carousel_tile_count || 6;
  const resp = await fetch(`/api/v2/help_center/articles.json?sort_by=created_at&sort_order=desc&per_page=${tileCount}`);
  const data = await resp.json();
  const articles = Array.isArray(data.articles) ? data.articles : [];

  container.innerHTML = '';
  if (!articles.length) {
    container.innerHTML = '<div class="carousel-empty">No articles found.</div>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'carousel-grid';

  articles.forEach(article => {
    const tile = document.createElement('div');
    tile.className = 'carousel-tile';
    tile.innerHTML = `
      <a href="${article.html_url}" class="carousel-tile-link">
        <div class="carousel-tile-title">${article.title}</div>
        <div class="carousel-tile-date">${new Date(article.created_at).toLocaleDateString()}</div>
      </a>
    `;
    grid.appendChild(tile);
  });

  container.appendChild(grid);
}

// On DOMContentLoaded, render the carousel
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => renderCarousel(window.settings));
} else {
  renderCarousel(window.settings);
}

