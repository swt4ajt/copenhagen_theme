// src/dynamicCategoriesNav.js
// Fetches categories and sections from Zendesk Help Center API and renders them in the header

const API_BASE = '/api/v2/help_center/en-us';

async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories.json`);
  const data = await res.json();
  return data.categories || [];
}

async function fetchSections(categoryId) {
  const res = await fetch(`${API_BASE}/categories/${categoryId}/sections.json`);
  const data = await res.json();
  return data.sections || [];
}

function createDropdown(categoriesWithSections) {
  const nav = document.createElement('nav');
  nav.className = 'categories-nav';
  nav.setAttribute('aria-label', 'Main navigation');
  const ul = document.createElement('ul');
  ul.className = 'categories-nav-list';

  categoriesWithSections.forEach(cat => {
    const li = document.createElement('li');
    li.className = 'category-dropdown';
    const btn = document.createElement('button');
    btn.className = 'category-toggle';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = cat.name;
    btn.onclick = () => {
      menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', menu.classList.contains('open'));
    };
    li.appendChild(btn);

    const menu = document.createElement('ul');
    menu.className = 'category-sections-list';
    cat.sections.forEach(section => {
      const sectionLi = document.createElement('li');
      const sectionA = document.createElement('a');
      sectionA.href = `/hc/en-us/sections/${section.id}`;
      sectionA.textContent = section.name;
      sectionLi.appendChild(sectionA);
      menu.appendChild(sectionLi);
    });
    li.appendChild(menu);
    ul.appendChild(li);
  });
  nav.appendChild(ul);
  return nav;
}

export async function renderDynamicCategoriesNav() {
  const container = document.getElementById('dynamic-categories-nav');
  if (!container) return;
  const categories = await fetchCategories();
  const categoriesWithSections = await Promise.all(
    categories.map(async cat => ({
      ...cat,
      sections: await fetchSections(cat.id)
    }))
  );
  container.innerHTML = '';
  container.appendChild(createDropdown(categoriesWithSections));
}

// Optionally, auto-run on DOMContentLoaded
if (document.readyState !== 'loading') {
  renderDynamicCategoriesNav();
} else {
  document.addEventListener('DOMContentLoaded', renderDynamicCategoriesNav);
}

