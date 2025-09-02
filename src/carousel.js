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

async function loadAnnouncementImages() {
  const slides = document.querySelectorAll(
    "#announcements-carousel .carousel-item"
  );
  for (const slide of slides) {
    const id = slide.dataset.articleId;
    if (!id) continue;
    try {
      const response = await fetch(`/api/v2/help_center/articles/${id}.json`);
      const data = await response.json();
      const match = data.article.body.match(/<img[^>]+src="([^"]+)"/i);
      if (match) {
        const img = slide.querySelector("img");
        if (img) {
          img.src = match[1];
        }
      }
    } catch (e) {
      // ignore errors
    }
  }
}

async function loadIntroductions() {
  const container = document.querySelector("#introductions-carousel");
  if (!container) return;
  try {
    const secResp = await fetch(
      "/api/v2/help_center/sections.json?per_page=100"
    );
    const secData = await secResp.json();
    const introSection = secData.sections.find(
      (s) => s.name && s.name.toLowerCase() === "introductions"
    );
    if (!introSection) return;
    const artResp = await fetch(
      `/api/v2/help_center/sections/${introSection.id}/articles.json?per_page=3&sort_by=created_at&sort_order=desc`
    );
    const artData = await artResp.json();
    artData.articles.forEach((article) => {
      const div = document.createElement("div");
      div.className = "carousel-item";
      const match = article.body.match(/<img[^>]+src="([^"]+)"/i);
      const img = match
        ? `<img src="${match[1]}" alt="${article.title}" />`
        : "";
      const text = article.body
        .replace(/<[^>]+>/g, "")
        .split(/\s+/)
        .slice(0, 20)
        .join(" ");
      div.innerHTML = `${img}<h3>${article.title}</h3><p>${text} <a href="${article.html_url}">read more...</a></p>`;
      container.appendChild(div);
    });
    initCarousel("#introductions-carousel", 3);
  } catch (e) {
    // ignore errors
  }
}

function init() {
  initCarousel("#company-carousel");
  const announcementCarousel = document.querySelector(
    "#announcements-carousel"
  );
  if (announcementCarousel) {
    initCarousel("#announcements-carousel", 3);
    loadAnnouncementImages();
  }
  loadIntroductions();
}

document.addEventListener("DOMContentLoaded", init);
