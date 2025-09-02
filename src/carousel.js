// --- Announcements + Introductions loaders (clean + safe) ---

(function () {
  "use strict";

  // Helpers
  const extractFirstImage = (html = "") => {
    const m = html.match(/<img[^>]+src="([^"]+)"/i);
    return m ? m[1] : null;
  };

  const stripHtml = (html = "") => html.replace(/<[^>]+>/g, "");
  const truncateWords = (text = "", n = 20) =>
    text.split(/\s+/).filter(Boolean).slice(0, n).join(" ");

  const getLocale = () => (document.documentElement.lang || "en-us").toLowerCase();

  // --- Announcements (label: Announcements) ---
  async function loadAnnouncements() {
    const container = document.querySelector("#announcement-carousel");
    const list = document.querySelector("#announcement-list");
    if (!container && !list) return;

    try {
      const resp = await fetch(
        `/api/v2/help_center/${getLocale()}/articles.json?label_names=Announcements&per_page=4&sort_by=created_at&sort_order=desc`
      );
      const data = await resp.json().catch(() => null);
      if (!data || !Array.isArray(data.articles)) return;

      data.articles.forEach((article) => {
        const body = article.body || "";
        const title = article.title || "";
        const url = article.html_url || "#";

        if (container) {
          const div = document.createElement("div");
          div.className = "carousel-item";
          const imgUrl = extractFirstImage(body);
          const imgTag = imgUrl ? `<img src="${imgUrl}" alt="${title}">` : "";
          div.innerHTML = `${imgTag}<span>${title}</span>`;
          container.appendChild(div);
        }

        if (list) {
          const li = document.createElement("li");
          li.className = "announcement-item";
          li.innerHTML = `<a href="${url}">${title}</a>`;
          list.appendChild(li);
        }
      });

      if (container && container.children.length) {
        let index = 0;
        const items = Array.from(container.children);
        items[0].classList.add("active");
        setInterval(() => {
          items[index].classList.remove("active");
          index = (index + 1) % items.length;
          items[index].classList.add("active");
        }, 5000);
      }
    } catch {
      /* ignore */
    }
  }

  /**
   * Small Introductions block:
   * - If #introductions-carousel exists, render cards with image+title+snippet
   * - If #introductions-list exists, render a simple UL list of titles
   * Data source: articles labeled "introductions" (locale-aware)
   */
  async function loadIntroductions() {
    const container = document.querySelector("#introductions-carousel");
    const list = document.querySelector("#introductions-list");
    if (!container && !list) return;

    try {
      const resp = await fetch(
        `/api/v2/help_center/${getLocale()}/articles.json?label_names=introductions&per_page=5&sort_by=created_at&sort_order=desc`
      );
      const data = await resp.json().catch(() => null);
      if (!data || !Array.isArray(data.articles)) return;

      data.articles.forEach((article) => {
        const body = article.body || "";
        const title = article.title || "";
        const url = article.html_url || "#";
        const imgUrl = extractFirstImage(body);
        const imgTag = imgUrl ? `<img src="${imgUrl}" alt="${title}">` : "";
        const text = truncateWords(stripHtml(body), 20);

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
    } catch {
      /* ignore */
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
      const resp = await fetch(
        `/api/v2/help_center/${getLocale()}/sections/4964692123039/articles.json?per_page=100&sort_by=created_at&sort_order=desc`
      );
      const data = await resp.json().catch(() => null);
      if (!data || !Array.isArray(data.articles)) return;

      data.articles.forEach((article) => {
        const body = article.body || "";
        const title = article.title || "";
        const url = article.html_url || "#";
        const img = extractFirstImage(body) || "https://via.placeholder.com/200?text=Pending%20Image";
        const text = truncateWords(stripHtml(body), 20);

        const div = document.createElement("div");
        div.className = "intro-item";
        div.innerHTML = `<a href="${url}"><img src="${img}" alt="${title}"><h3>${title}</h3><p>${text}...</p></a>`;
        container.appendChild(div);
      });
    } catch {
      /* ignore */
    }
  }

  // Homepage introductions grid (latest 4 from section 4964692123039)
  async function loadHomeIntroductionsGrid() {
    if (window.location.href.includes("4964692123039-Introductions")) return;

    const container = document.querySelector("#introductions-grid");
    if (!container) return;

    try {
      const resp = await fetch(
        `/api/v2/help_center/${getLocale()}/sections/4964692123039/articles.json?per_page=4&sort_by=created_at&sort_order=desc`
      );
      const data = await resp.json().catch(() => null);
      if (!data || !Array.isArray(data.articles)) return;

      data.articles.slice(0, 4).forEach((article) => {
        const body = article.body || "";
        const title = article.title || "";
        const url = article.html_url || "#";
        const img =
          extractFirstImage(body) ||
          "https://via.placeholder.com/200?text=Pending%20Image";
        const text = truncateWords(stripHtml(body), 20);

        const div = document.createElement("div");
        div.className = "intro-item";
        div.innerHTML = `<a href="${url}"><img src="${img}" alt="${title}"><h3>${title}</h3><p>${text}...</p></a>`;
        container.appendChild(div);
      });
    } catch {
      /* ignore */
    }
  }

  // Bootstrap
  function init() {
    loadAnnouncements();
    loadIntroductions();
    loadIntroductionTiles();
    loadHomeIntroductionsGrid();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
