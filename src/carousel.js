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

function init() {
  initCarousel("#company-carousel");
  const announcementCarousel = document.querySelector(
    "#announcements-carousel"
  );
  if (announcementCarousel) {
    initCarousel("#announcements-carousel", 3);
    loadAnnouncementImages();
  }
}

document.addEventListener("DOMContentLoaded", init);
