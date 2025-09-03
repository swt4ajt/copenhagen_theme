async function loadDepartments() {
  const list = document.querySelector(".department-rail .blocks-list");
  if (!list) return;
  try {
    const resp = await fetch(
      "/api/v2/help_center/categories/4961264026655/sections.json"
    );
    const data = await resp.json();
    data.sections.forEach((section) => {
      const li = document.createElement("li");
      li.className = "department-rail-item";
      const a = document.createElement("a");
      a.href = section.html_url;
      a.textContent = section.name;
      li.appendChild(a);
      list.appendChild(li);
    });
  } catch (e) {
    // ignore errors
  }
}

document.addEventListener("DOMContentLoaded", loadDepartments);
