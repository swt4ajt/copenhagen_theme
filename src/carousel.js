// --- Announcements + Introductions loaders (clean + safe) ---

async function loadAnnouncements() {
  const container = document.querySelector("#announcement-carousel");
  const list = document.querySelector("#announcement-list");
  if (!container && !list) return;

  try {
    const resp = await fetch(
      "/api/v2/help_center/articles.json?label_names=Announcements&per_page=5&sort_by=created_at&sort_order=desc"
    );
    const data = await resp.json().catch(() => null);
    if (!data || !Array.isArray(data.articles)) return;

    data.articles.forEach((article) => {
      const body = article.body || "";
      if (container) {
        const div = document.createElement("div");
        div.className = "carousel-item";
        const match = body.match(/<img[^>]+src="([^"]+)"/i);
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

/**
 * Small Introductions block:
 * - If #introductions-carousel exists, render cards with image+title+snippet
 * - If #introductions-list exists, render a simple UL list of titles
 * Data source: articles labeled "introductions" (locale-aware path)
 */
async function loadIntroductions() {
  const container = document.querySelector("#introductions-carousel");
  const list = document.querySelector("#introductions-list");
  if (!container && !list) return;

  try {
    const locale = document.documentElement.lang || "en-us";
    const resp = await fetch(
      `/api/v2/help_center/${locale}/articles.json?label_names=introductions&per_page=5&sort_by=created_at&sort_order=desc`
    );
    const data = await resp.json().catch(() => null);
    if (!data || !Array.isArray(data.articles)) return;

    data.articles.forEach((article) => {
      const body = article.body || "";
      const title = article.title || "";
      const url = article.html_url || "#";

      const match = body.match(/<img[^>]+src="([^"]+)"/i);
      const imgTag = match ? `<img src="${match[1]}" alt="${title}" />` : "";
      const text = body.replace(/<[^>]+>/g, "").split(/\s+/).slice(0, 20).join(" ");

      if (container) {
        const div = document.createElement("div");
        div.className = "intro-item";
        div.innerHTML = `<a href="${url}">${imgTag}<h3>${title}</h3><p>${text}...</p></a>`;
        container.appendChild(div);
      }

      if (list) {
        const li = document.createElement("li");
        li.className = "introduction-item";
        li.textContent = title;
        list.appendChild(li);
      }
    });
  } catch (e) {
    // ignore errors
  }
}

/**
 * Full Introductions section tiles:
 * - Replaces the default `.article-list` with a grid of tiles for section 4964692123039
 * - Locale-aware section endpoint
 */
async function loadIntroductionTiles() {
  // Only activate on the Introductions section page
  if (!window.location.href.includes("4964692123039-Introductions")) return;

  const list = document.querySelector(".article-list");
  if (!list) return;

  // Hide standard list and append grid
  list.style.display = "none";
  const container = document.createElement("div");
  container.id = "introductions-grid";
  list.parentNode.appendChild(container);

  try {
    const locale = document.documentElement.lang || "en-us";
    const resp = await fetch(
      `/api/v2/help_center/${locale}/sections/4964692123039/articles.json?per_page=100&sort_by=created_at&sort_order=desc`
    );
    const data = await resp.json().catch(() => null);
    if (!data || !Array.isArray(data.articles)) return;

    data.articles.forEach((article) => {
      const body = article.body || "";
      const title = article.title || "";
      const url = article.html_url || "#";

      const match = body.match(/<img[^>]+src="([^"]+)"/i);
      const img = match ? match[1] : "https://via.placeholder.com/200?text=Pending%20Image";
      const text = body.replace(/<[^>]+>/g, "").split(/\s+/).slice(0, 20).join(" ");

      const div = document.createElement("div");
      div.className = "intro-item";
      div.innerHTML = `<a href="${url}"><img src="${img}" alt="${title}" /><h3>${title}</h3><p>${text}...</p></a>`;
      container.appendChild(div);
    });
  } catch (e) {
    // ignore errors
  }
}

// Bootstrap
function init() {
  loadAnnouncements();
  loadIntroductions();
  loadIntroductionTiles();
}
document.addEventListener("DOMContentLoaded", init);
