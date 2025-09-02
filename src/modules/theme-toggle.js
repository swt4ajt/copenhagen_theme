/* eslint-disable check-file/filename-naming-convention */
window.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".theme-toggle");
  const body = document.body;
  const STORAGE_KEY = "preferred-theme";

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark") {
    body.classList.add("dark-mode");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      const isDark = body.classList.toggle("dark-mode");
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    });
  }
});
