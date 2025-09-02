export function initCarousel(selector, limit = Infinity) {
  const container = document.querySelector(selector);
  if (!container) return;
  let slides = Array.from(container.querySelectorAll(".carousel-item"));
  if (limit !== Infinity) {
    slides.slice(limit).forEach((slide) => slide.remove());
    slides = slides.slice(0, limit);
  }
  let index = 0;
  if (slides.length) {
    slides[0].classList.add("active");
    setInterval(() => {
      slides[index].classList.remove("active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("active");
    }, 5000);
  }
}

async function loadAnnouncements() {
  const container = document.querySelector("#company-carousel");
  if (!container) return;
  try {
    const resp = await fetch(
      "/api/v2/help_center/articles.json?label_names=Announcements&per_page=3&sort_by=created_at&sort_order=desc"
    );
    const data = await resp.json();
    data.articles.forEach((article) => {
      const div = document.createElement("div");
      div.className = "carousel-item";
      const match = article.body.match(/<img[^>]+src=\"([^\"]+)\"/i);
      const img = match ? `<img src="${match[1]}" alt="${article.title}" />` : "";
      div.innerHTML = `${img}<span>${article.title}</span>`;
      container.appendChild(div);
    });
    initCarousel("#company-carousel", 3);
  } catch (e) {
    // ignore errors
  }
}

async function loadIntroductions() {
  const container = document.querySelector("#introductions-grid");
  if (!container) return;
  try {
    const resp = await fetch(
      "/api/v2/help_center/articles.json?label_names=introductions&per_page=4&sort_by=created_at&sort_order=desc"
    );
    const data = await resp.json();
    data.articles.forEach((article) => {
      const div = document.createElement("div");
      div.className = "intro-item";
      const match = article.body.match(/<img[^>]+src=\"([^\"]+)\"/i);
      const img = match ? `<img src="${match[1]}" alt="${article.title}" />` : "";
      const text = article.body
        .replace(/<[^>]+>/g, "")
        .split(/\s+/)
        .slice(0, 20)
        .join(" ");
      div.innerHTML = `${img}<h3>${article.title}</h3><p>${text}...</p>`;
      container.appendChild(div);
    });
  } catch (e) {
    // ignore errors
  }
}

function init() {
  loadAnnouncements();
  loadIntroductions();
}

document.addEventListener("DOMContentLoaded", init);
