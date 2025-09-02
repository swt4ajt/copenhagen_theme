async function loadAnnouncements() {
  const list = document.querySelector("#announcement-list");
  if (!list) return;
  try {
    const resp = await fetch(
      "/api/v2/help_center/articles.json?label_names=Announcements&per_page=5&sort_by=created_at&sort_order=desc"
    );
    const data = await resp.json();
    data.articles.forEach((article) => {
      const div = document.createElement("div");
      div.className = "carousel-item";
      const match = article.body.match(/<img[^>]+src="([^"]+)"/i);
      const img = match
        ? `<img src="${match[1]}" alt="${article.title}" />`
        : "";
      div.innerHTML = `${img}<span>${article.title}</span>`;
      container.appendChild(div);
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
    const locale = document.documentElement.lang;
    const resp = await fetch(
      `/api/v2/help_center/${locale}/articles.json?label_names=introductions&per_page=100&sort_by=created_at&sort_order=desc`
    );
    const data = await resp.json();
    data.articles.forEach((article) => {
      const div = document.createElement("div");
      div.className = "intro-item";
      const match = article.body.match(/<img[^>]+src="([^"]+)"/i);
      const img = match
        ? `<img src="${match[1]}" alt="${article.title}" />`
        : "";
      const text = article.body
        .replace(/<[^>]+>/g, "")
        .split(/\s+/)
        .slice(0, 20)
        .join(" ");
      div.innerHTML = `<a href="${article.html_url}">${img}<h3>${article.title}</h3><p>${text}...</p></a>`;
      container.appendChild(div);
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
