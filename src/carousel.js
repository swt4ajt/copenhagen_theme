async function loadAnnouncements() {
  const container = document.querySelector("#announcement-carousel");
  const list = document.querySelector("#announcement-list");
  if (!container && !list) return;
  try {
    const resp = await fetch(
      "/api/v2/help_center/articles.json?label_names=Announcements&per_page=5&sort_by=created_at&sort_order=desc"
    );
    const data = await resp.json().catch(() => null);
    if (!data) return;
    data.articles.forEach((article) => {
      if (container) {
        const div = document.createElement("div");
        div.className = "carousel-item";
        const match = article.body.match(/<img[^>]+src="([^"]+)"/i);
        const img = match
          ? `<img src="${match[1]}" alt="${article.title}" />`
          : "";
        div.innerHTML = `${img}<span>${article.title}</span>`;
        container.appendChild(div);
      }
      if (list) {
        const li = document.createElement("li");
        li.className = "announcement-item";
        li.innerHTML = `<a href="${article.html_url}">${article.title}</a>`;
        list.appendChild(li);
      }
    });
  } catch (e) {
    // ignore errors
  }
}

async function loadIntroductions() {
  const container = document.querySelector("#introductions-grid");
  if (!container) return;
  try {
    const resp = await fetch(
      "/api/v2/help_center/sections/4964692123039/articles.json?per_page=5&sort_by=created_at&sort_order=desc"
    );
    const data = await resp.json().catch(() => null);
    if (!data) return;
    data.articles.forEach((article) => {
      const div = document.createElement("div");
      div.className = "intro-item";
      const match = article.body.match(/<img[^>]+src=\"([^\"]+)\"/i);
      const img = match
        ? match[1]
        : "https://via.placeholder.com/200?text=Pending%20Image";
      const text = article.body
        .replace(/<[^>]+>/g, "")
        .split(/\s+/)
        .slice(0, 20)
        .join(" ");
      div.innerHTML = `<a href="${article.html_url}"><img src="${img}" alt="${article.title}" /><h3>${article.title}</h3><p>${text}...</p></a>`;
      container.appendChild(div);
    });
  } catch (e) {
    // ignore errors
  }
}

async function loadIntroductionTiles() {
  if (!window.location.href.includes("4964692123039-Introductions")) return;
  const list = document.querySelector(".article-list");
  if (!list) return;
  list.style.display = "none";
  const container = document.createElement("div");
  container.id = "introductions-grid";
  list.parentNode.appendChild(container);
  try {
    const resp = await fetch(
      "/api/v2/help_center/sections/4964692123039/articles.json?per_page=100&sort_by=created_at&sort_order=desc"
    );
    const data = await resp.json().catch(() => null);
    if (!data) return;
    data.articles.forEach((article) => {
      const div = document.createElement("div");
      div.className = "intro-item";
      const match = article.body.match(/<img[^>]+src="([^"]+)"/i);
      const img = match
        ? match[1]
        : "https://via.placeholder.com/200?text=Pending%20Image";
      const text = article.body
        .replace(/<[^>]+>/g, "")
        .split(/\s+/)
        .slice(0, 20)
        .join(" ");
      div.innerHTML = `<a href="${article.html_url}"><img src="${img}" alt="${article.title}" /><h3>${article.title}</h3><p>${text}...</p></a>`;
      container.appendChild(div);
    });
  } catch (e) {
    // ignore errors
  }
}

function init() {
  loadAnnouncements();
  loadIntroductions();
  loadIntroductionTiles();
}

document.addEventListener("DOMContentLoaded", init);
