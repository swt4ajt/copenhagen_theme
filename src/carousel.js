export function initCarousel() {
  const slides = document.querySelectorAll("#company-carousel .carousel-item");
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

document.addEventListener("DOMContentLoaded", initCarousel);
