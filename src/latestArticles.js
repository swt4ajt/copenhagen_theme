// src/latestArticles.js
// Populates the latest articles list in the right rail

export async function renderLatestArticles() {
  const list = document.getElementById("latest-articles-list");
  if (!list) return;

  const categoryId = list.dataset.categoryId;
  const url = categoryId
    ? `/api/v2/help_center/categories/${categoryId}/articles.json?sort_by=created_at&sort_order=desc&per_page=5`
    : "/api/v2/help_center/articles.json?sort_by=created_at&sort_order=desc&per_page=5";
  const resp = await fetch(url);
  const data = await resp.json();
  const articles = Array.isArray(data.articles) ? data.articles : [];

  list.innerHTML = "";
  if (!articles.length) {
    list.innerHTML =
      '<li class="latest-articles-empty">No articles found.</li>';
    return;
  }

  articles.forEach((article) => {
    const li = document.createElement("li");
    li.className = "latest-articles-item";
    li.innerHTML = `
      <a href="${article.html_url}" class="latest-articles-link">
        <span class="latest-articles-title">${article.title}</span>
        <span class="latest-articles-date">${new Date(
          article.created_at
        ).toLocaleDateString()}</span>
      </a>`;
    list.appendChild(li);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderLatestArticles);
} else {
  renderLatestArticles();
}
