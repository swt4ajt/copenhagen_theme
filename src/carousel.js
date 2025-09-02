async function loadAnnouncements() {
  const list = document.querySelector("#announcement-list");
  if (!list) return;
  try {
    const resp = await fetch(
      "/api/v2/help_center/articles.json?label_names=Announcements&per_page=5&sort_by=created_at&sort_order=desc"
    );
    const data = await resp.json();
    data.articles.forEach((article) => {
      const li = document.createElement("li");
      li.className = "announcement-item";
      li.innerHTML = `<a href="${article.html_url}">${article.title}</a>`;
      list.appendChild(li);
    });
  } catch (e) {
    // ignore errors
  }
}

async function loadIntroductions() {
  const list = document.querySelector("#introductions-list");
  if (!list) return;
  try {
    const resp = await fetch(
      "/api/v2/help_center/articles.json?label_names=introductions&per_page=5&sort_by=created_at&sort_order=desc"
    );
    const data = await resp.json();
    data.articles.forEach((article) => {
      const li = document.createElement("li");
      li.className = "introduction-item";
      li.textContent = article.title;
      list.appendChild(li);
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
