// src/announcements.js
// Fetches and renders a simple carousel of company announcements

export async function renderAnnouncements() {
  const container = document.getElementById('announcement-carousel');
  if (!container) return;

  const link = document.querySelector('.announcements h2 a');
  const match = link && link.getAttribute('href').match(/sections\/(\d+)/);
  const sectionId = match ? match[1] : null;

  const resp = sectionId
    ? await fetch(`/api/v2/help_center/sections/${sectionId}/articles.json?sort_by=created_at&sort_order=desc&per_page=5`)
    : null;
  const data = resp && (await resp.json());
  const articles = (data && Array.isArray(data.articles))
    ? data.articles.filter((article) => !article.draft && article.html_url)
    : [];

  container.innerHTML = '';
  if (!articles.length) {
    container.innerHTML = '<div class="announcement-empty">No announcements found.</div>';
    return;
  }

  articles.forEach((article, index) => {
    const item = document.createElement('div');
    item.className = `carousel-item${index === 0 ? ' active' : ''}`;

    const body = article.body || '';
    const imgMatch = body.match(/<img[^>]+src=["']([^"']+)["']/i);
    const imgTag = imgMatch
      ? `<img src="${imgMatch[1]}" alt="" />`
      : '<span class="carousel-image-placeholder"></span>';
    const captionClass = imgMatch ? 'carousel-caption' : 'carousel-caption no-image';

    item.innerHTML = `
      <a href="${article.html_url}" class="carousel-link">
        ${imgTag}
        <div class="${captionClass}">${article.title}</div>
      </a>
    `;
    container.appendChild(item);
  });

  let current = 0;
  setInterval(() => {
    const items = container.querySelectorAll('.carousel-item');
    if (!items.length) return;
    items[current].classList.remove('active');
    current = (current + 1) % items.length;
    items[current].classList.add('active');
  }, 5000);
}
