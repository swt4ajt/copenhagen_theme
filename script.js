(function () {
  'use strict';

  // Dropdown class and initialization
  const isPrintableChar = (str) => {
    return str.length === 1 && str.match(/^\S$/);
  };

  function Dropdown(toggle, menu) {
    this.toggle = toggle;
    this.menu = menu;
    this.menuPlacement = {
      top: menu.classList.contains("dropdown-menu-top"),
      end: menu.classList.contains("dropdown-menu-end"),
    };
    this.toggle.addEventListener("click", this.clickHandler.bind(this));
    this.toggle.addEventListener("keydown", this.toggleKeyHandler.bind(this));
    this.menu.addEventListener("keydown", this.menuKeyHandler.bind(this));
    document.body.addEventListener("click", this.outsideClickHandler.bind(this));
    const toggleId = this.toggle.getAttribute("id") || crypto.randomUUID();
    const menuId = this.menu.getAttribute("id") || crypto.randomUUID();
    this.toggle.setAttribute("id", toggleId);
    this.menu.setAttribute("id", menuId);
    this.toggle.setAttribute("aria-controls", menuId);
    this.menu.setAttribute("aria-labelledby", toggleId);
    this.menu.setAttribute("tabindex", -1);
    this.menuItems.forEach((menuItem) => {
      menuItem.tabIndex = -1;
    });
    this.focusedIndex = -1;
  }

  Dropdown.prototype = {
    get isExpanded() {
      return this.toggle.getAttribute("aria-expanded") === "true";
    },
    get menuItems() {
      return Array.prototype.slice.call(
        this.menu.querySelectorAll("[role='menuitem'], [role='menuitemradio']")
      );
    },
    dismiss: function () {
      if (!this.isExpanded) return;
      this.toggle.removeAttribute("aria-expanded");
      this.menu.classList.remove("dropdown-menu-end", "dropdown-menu-top");
      this.focusedIndex = -1;
    },
    open: function () {
      if (this.isExpanded) return;
      this.toggle.setAttribute("aria-expanded", true);
      this.handleOverflow();
    },
    handleOverflow: function () {
      var rect = this.menu.getBoundingClientRect();
      var overflow = {
        right: rect.left < 0 || rect.left + rect.width > window.innerWidth,
        bottom: rect.top < 0 || rect.top + rect.height > window.innerHeight,
      };
      if (overflow.right || this.menuPlacement.end) {
        this.menu.classList.add("dropdown-menu-end");
      }
      if (overflow.bottom || this.menuPlacement.top) {
        this.menu.classList.add("dropdown-menu-top");
      }
      if (this.menu.getBoundingClientRect().top < 0) {
        this.menu.classList.remove("dropdown-menu-top");
      }
    },
    focusByIndex: function (index) {
      if (!this.menuItems.length) return;
      this.menuItems.forEach((item, itemIndex) => {
        if (itemIndex === index) {
          item.tabIndex = 0;
          item.focus();
        } else {
          item.tabIndex = -1;
        }
      });
      this.focusedIndex = index;
    },
    focusFirstMenuItem: function () {
      this.focusByIndex(0);
    },
    focusLastMenuItem: function () {
      this.focusByIndex(this.menuItems.length - 1);
    },
    focusNextMenuItem: function (currentItem) {
      if (!this.menuItems.length) return;
      const currentIndex = this.menuItems.indexOf(currentItem);
      const nextIndex = (currentIndex + 1) % this.menuItems.length;
      this.focusByIndex(nextIndex);
    },
    focusPreviousMenuItem: function (currentItem) {
      if (!this.menuItems.length) return;
      const currentIndex = this.menuItems.indexOf(currentItem);
      const previousIndex =
        currentIndex <= 0 ? this.menuItems.length - 1 : currentIndex - 1;
      this.focusByIndex(previousIndex);
    },
    focusByChar: function (currentItem, char) {
      char = char.toLowerCase();
      const itemChars = this.menuItems.map((menuItem) =>
        menuItem.textContent.trim()[0].toLowerCase()
      );
      const startIndex =
        (this.menuItems.indexOf(currentItem) + 1) % this.menuItems.length;
      let index = itemChars.indexOf(char, startIndex);
      if (index === -1) {
        index = itemChars.indexOf(char, 0);
      }
      if (index > -1) {
        this.focusByIndex(index);
      }
    },
    outsideClickHandler: function (e) {
      if (
        this.isExpanded &&
        !this.toggle.contains(e.target) &&
        !e.composedPath().includes(this.menu)
      ) {
        this.dismiss();
        this.toggle.focus();
      }
    },
    clickHandler: function (event) {
      event.stopPropagation();
      event.preventDefault();
      if (this.isExpanded) {
        this.dismiss();
        this.toggle.focus();
      } else {
        this.open();
        this.focusFirstMenuItem();
      }
    },
    toggleKeyHandler: function (e) {
      const key = e.key;
      switch (key) {
        case "Enter":
        case " ":
        case "ArrowDown":
        case "Down": {
          e.stopPropagation();
          e.preventDefault();
          this.open();
          this.focusFirstMenuItem();
          break;
        }
        case "ArrowUp":
        case "Up": {
          e.stopPropagation();
          e.preventDefault();
          this.open();
          this.focusLastMenuItem();
          break;
        }
        case "Esc":
        case "Escape": {
          e.stopPropagation();
          e.preventDefault();
          this.dismiss();
          this.toggle.focus();
          break;
        }
      }
    },
    menuKeyHandler: function (e) {
      const key = e.key;
      const currentElement = this.menuItems[this.focusedIndex];
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }
      switch (key) {
        case "Esc":
        case "Escape": {
          this.dismiss();
          this.toggle.focus();
          break;
        }
        case "ArrowDown":
        case "Down": {
          this.focusNextMenuItem(currentElement);
          break;
        }
        case "ArrowUp":
        case "Up": {
          this.focusPreviousMenuItem(currentElement);
          break;
        }
        case "Home":
        case "PageUp": {
          this.focusFirstMenuItem();
          break;
        }
        case "End":
        case "PageDown": {
          this.focusLastMenuItem();
          break;
        }
        case "Tab": {
          if (e.shiftKey) {
            this.dismiss();
            this.toggle.focus();
          } else {
            this.dismiss();
          }
          break;
        }
        default: {
          if (isPrintableChar(key)) {
            this.focusByChar(currentElement, key);
          }
        }
      }
    },
  };

  // Drodowns

  window.addEventListener("DOMContentLoaded", () => {
    const dropdowns = [];
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

    dropdownToggles.forEach((toggle) => {
      const menu = toggle.nextElementSibling;
      if (menu && menu.classList.contains("dropdown-menu")) {
        dropdowns.push(new Dropdown(toggle, menu));
      }
    });
  });

  // Key map
  const ENTER = 13;

  // Focus management for forms
  const key = "returnFocusTo";

  function saveFocus() {
    const activeElementId = document.activeElement.getAttribute("id");
    sessionStorage.setItem(key, "#" + activeElementId);
  }

  function returnFocus() {
    const returnFocusTo = sessionStorage.getItem(key);
    if (returnFocusTo) {
      sessionStorage.removeItem("returnFocusTo");
      const returnFocusToEl = document.querySelector(returnFocusTo);
      returnFocusToEl && returnFocusToEl.focus && returnFocusToEl.focus();
    }
  }

  // Forms

  window.addEventListener("DOMContentLoaded", () => {
    try {
      // In some cases we should preserve focus after page reload
      returnFocus();
      // show form controls when the textarea receives focus or back button is used and value exists
      const commentContainerTextarea = document.querySelector(
        ".comment-container textarea"
      );
      const commentContainerFormControls = document.querySelector(
        ".comment-form-controls, .comment-ccs"
      );
      if (commentContainerTextarea && commentContainerFormControls) {
        commentContainerTextarea.addEventListener(
          "focus",
          function focusCommentContainerTextarea() {
            commentContainerFormControls.style.display = "block";
            commentContainerTextarea.removeEventListener(
              "focus",
              focusCommentContainerTextarea
            );
          }
        );
        if (commentContainerTextarea.value !== "") {
          commentContainerFormControls.style.display = "block";
        }
      }
      // Expand Request comment form when Add to conversation is clicked
      const showRequestCommentContainerTrigger = document.querySelector(
        ".request-container .comment-container .comment-show-container"
      );
      const requestCommentFields = document.querySelectorAll(
        ".request-container .comment-container .comment-fields"
      );
      const requestCommentSubmit = document.querySelector(
        ".request-container .comment-container .request-submit-comment"
      );
      if (
        showRequestCommentContainerTrigger &&
        requestCommentFields &&
        requestCommentSubmit
      ) {
        showRequestCommentContainerTrigger.addEventListener("click", () => {
          showRequestCommentContainerTrigger.style.display = "none";
          Array.prototype.forEach.call(requestCommentFields, (element) => {
            element.style.display = "block";
          });
          requestCommentSubmit.style.display = "inline-block";
          if (commentContainerTextarea) {
            commentContainerTextarea.focus();
          }
        });
      }
      // Mark as solved button
      const requestMarkAsSolvedButton = document.querySelector(
        ".request-container .mark-as-solved:not([data-disabled])"
      );
      const requestMarkAsSolvedCheckbox = document.querySelector(
        ".request-container .comment-container input[type=checkbox]"
      );
      const requestCommentSubmitButton = document.querySelector(
        ".request-container .comment-container input[type=submit]"
      );

      if (requestMarkAsSolvedButton) {
        requestMarkAsSolvedButton.addEventListener("click", () => {
          requestMarkAsSolvedCheckbox.setAttribute("checked", true);
          requestCommentSubmitButton.disabled = true;
          requestMarkAsSolvedButton.setAttribute("data-disabled", true);
          requestMarkAsSolvedButton.form.submit();
        });
      }

      // Change Mark as solved text according to whether comment is filled
      const requestCommentTextarea = document.querySelector(
        ".request-container .comment-container textarea"
      );

      const usesWysiwyg =
        requestCommentTextarea &&
        requestCommentTextarea.dataset.helper === "wysiwyg";

      const isEmptyPlaintext = (s) => s.trim() === "";

      const isEmptyHtml = (xml) => {
        const doc = new DOMParser().parseFromString(`<_>${xml}</_>`, "text/xml");
        const img = doc.querySelector("img");
        return img === null && isEmptyPlaintext(doc.children[0].textContent);
      };

      const isEmpty = usesWysiwyg ? isEmptyHtml : isEmptyPlaintext;

      if (requestCommentTextarea) {
        requestCommentTextarea.addEventListener("input", () => {
          if (isEmpty(requestCommentTextarea.value)) {
            if (requestMarkAsSolvedButton) {
              requestMarkAsSolvedButton.innerText =
                requestMarkAsSolvedButton.getAttribute("data-solve-translation");
            }
          } else {
            if (requestMarkAsSolvedButton) {
              requestMarkAsSolvedButton.innerText =
                requestMarkAsSolvedButton.getAttribute(
                  "data-solve-and-submit-translation"
                );
            }
          }
        });
      }

      const selects = document.querySelectorAll(
        "#request-status-select, #request-organization-select"
      );

      selects.forEach((element) => {
        element.addEventListener("change", (event) => {
          event.stopPropagation();
          saveFocus();
          element.form.submit();
        });
      });

      // Submit requests filter form on search in the request list page
      const quickSearch = document.querySelector("#quick-search");
      if (quickSearch) {
        quickSearch.addEventListener("keyup", (event) => {
          if (event.keyCode === ENTER) {
            event.stopPropagation();
            saveFocus();
            quickSearch.form.submit();
          }
        });
      }

      // Submit organization form in the request page
      const requestOrganisationSelect = document.querySelector(
        "#request-organization select"
      );

      if (requestOrganisationSelect) {
        requestOrganisationSelect.addEventListener("change", () => {
          requestOrganisationSelect.form.submit();
        });

        requestOrganisationSelect.addEventListener("click", (e) => {
          // Prevents Ticket details collapsible-sidebar to close on mobile
          e.stopPropagation();
        });
      }

      // If there are any error notifications below an input field, focus that field
      const notificationElm = document.querySelector(".notification-error");
      if (
        notificationElm &&
        notificationElm.previousElementSibling &&
        typeof notificationElm.previousElementSibling.focus === "function"
      ) {
        notificationElm.previousElementSibling.focus();
      }

      // Prefill and hide subject/description for specific ticket forms
      const formId = document
        .querySelector("form[data-ticket-form-id]")
        ?.getAttribute("data-ticket-form-id");

      const subjectMap = {
        4959432829215: "New User Request",
        4959424709919: "User Deactivation Request",
      };

      const descriptionMap = {
        4959432829215:
          "New user request, please review the information submitted in the form and then action accordingly",
        4959424709919:
          "User deactivation request, please review the information submitted in the form and then action accordingly",
      };

      if (formId && subjectMap[formId]) {
        const subjectInput = document.querySelector('[name="request_subject"]');
        const descriptionInput = document.querySelector(
          '[name="request_description"]'
        );

        // Prefill and hide subject field
        if (subjectInput) {
          subjectInput.value = subjectMap[formId];
          subjectInput
            .closest(".form-field, .form-group, .form-control, label")
            ?.style.setProperty("display", "none", "important");
        }

        // Prefill and hide description field
        if (descriptionInput) {
          descriptionInput.value = descriptionMap[formId];
          descriptionInput
            .closest(".form-field, .form-group, .form-control, label")
            ?.style.setProperty("display", "none", "important");
        }
      }
    } catch (err) {
      console.error("Forms init error:", err);
    }
    // MutationObserver for async form rendering
    const formObserver = new MutationObserver(() => {
      try {
        const showRequestCommentContainerTrigger = document.querySelector(
          ".request-container .comment-container .comment-show-container"
        );
        const requestCommentFields = document.querySelectorAll(
          ".request-container .comment-container .comment-fields"
        );
        const requestCommentSubmit = document.querySelector(
          ".request-container .comment-container .request-submit-comment"
        );
        const commentContainerTextarea = document.querySelector(
          ".comment-container textarea"
        );
        const commentContainerFormControls = document.querySelector(
          ".comment-form-controls, .comment-ccs"
        );
        if (
          showRequestCommentContainerTrigger &&
          requestCommentFields &&
          requestCommentSubmit &&
          !showRequestCommentContainerTrigger.hasAttribute("data-form-init")
        ) {
          showRequestCommentContainerTrigger.setAttribute(
            "data-form-init",
            "true"
          );
          showRequestCommentContainerTrigger.addEventListener("click", () => {
            showRequestCommentContainerTrigger.style.display = "none";
            Array.prototype.forEach.call(requestCommentFields, (element) => {
              element.style.display = "block";
            });
            requestCommentSubmit.style.display = "inline-block";
            if (commentContainerTextarea) {
              commentContainerTextarea.focus();
            }
          });
        }
        if (
          commentContainerTextarea &&
          commentContainerFormControls &&
          !commentContainerTextarea.hasAttribute("data-form-init")
        ) {
          commentContainerTextarea.setAttribute("data-form-init", "true");
          commentContainerTextarea.addEventListener(
            "focus",
            function focusCommentContainerTextarea() {
              commentContainerFormControls.style.display = "block";
              commentContainerTextarea.removeEventListener(
                "focus",
                focusCommentContainerTextarea
              );
            }
          );
          if (commentContainerTextarea.value !== "") {
            commentContainerFormControls.style.display = "block";
          }
        }
      } catch (err) {
        console.error("Forms observer error:", err);
      }
    });
    formObserver.observe(document.body, { childList: true, subtree: true });
  });

  // Carousel module: fetches and renders tiles based on theme setting

  async function renderCarousel(settings = {}) {
    const container = document.getElementById('homepage-carousel');
    if (!container) return;

    const tileCount = parseInt(settings.carousel_tile_count, 10) || 6;
    const resp = await fetch(`/api/v2/help_center/articles.json?sort_by=created_at&sort_order=desc&per_page=${tileCount}`);
    const data = await resp.json();
    const articles = Array.isArray(data.articles) ? data.articles : [];

    container.innerHTML = '';
    if (!articles.length) {
      container.innerHTML = '<div class="carousel-empty">No articles found.</div>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'carousel-grid';

    articles.forEach(article => {
      const tile = document.createElement('div');
      tile.className = 'carousel-tile';
      tile.innerHTML = `
      <a href="${article.html_url}" class="carousel-tile-link">
        <div class="carousel-tile-title">${article.title}</div>
        <div class="carousel-tile-date">${new Date(article.created_at).toLocaleDateString()}</div>
      </a>
    `;
      grid.appendChild(tile);
    });

    container.appendChild(grid);
  }

  // On DOMContentLoaded, render the carousel
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderCarousel(window.settings || {}));
  } else {
    renderCarousel(window.settings || {});
  }

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

  window.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("request-form-container");
    if (!container) {
      return;
    }

    const dataUrl = container.dataset.forms || "/api/v2/ticket_forms.json";
    const settings = JSON.parse(container.dataset.settings || "{}");
    const formSettings = {};
    for (let i = 1; i <= 10; i += 1) {
      const id = settings[`request_form_${i}_id`];
      if (!id) continue;
      formSettings[id] = {
        name: settings[`request_form_${i}_name`],
        description: settings[`request_form_${i}_description`],
        section: settings[`request_form_${i}_section`] || "Other",
      };
    }

    fetch(dataUrl)
      .then((response) => response.json())
      .then((data) => {
        const forms = data.ticket_forms || data.forms || [];
        const sections = {};
        forms.forEach((form) => {
          const override = formSettings[form.id] || {};
          const name = override.name || form.name;
          const description = override.description || form.description || "";
          const section = override.section || "Other";
          if (!sections[section]) {
            sections[section] = [];
          }
          sections[section].push({ id: form.id, name, description });
        });

        Object.keys(sections).forEach((sectionName) => {
          const sectionEl = document.createElement("section");
          sectionEl.className = "request-form-section";
          const titleEl = document.createElement("h2");
          titleEl.className = "request-form-section-title";
          titleEl.textContent = sectionName;
          sectionEl.appendChild(titleEl);

          const formsContainer = document.createElement("div");
          formsContainer.className = "request-form-section-forms";
          sections[sectionName].forEach((f) => {
            const card = document.createElement("div");
            card.className = "request-form-card";
            const desc = f.description ? `<p>${f.description}</p>` : "";
            card.innerHTML = `
            <h3>${f.name}</h3>
            ${desc}
            <a href="${window.location.pathname}?ticket_form_id=${f.id}" class="request-form-link">Open</a>
          `;
            formsContainer.appendChild(card);
          });

          sectionEl.appendChild(formsContainer);
          container.appendChild(sectionEl);
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Failed to load request forms:", error);
      });
  });

  // Uniken Holidays Calendar Component
  // Usage: Call renderHolidaysCalendar(targetSelector)

  function extractHolidaysFromArticle(articleSelector) {
    const holidaysData = {};
    const article = document.querySelector(articleSelector);
    if (!article) return holidaysData;
    const sections = article.querySelectorAll('section');
    sections.forEach(section => {
      const region = section.id.replace('-2025', '').toUpperCase();
      const rows = section.querySelectorAll('table tbody tr');
      const holidays = [];
      rows.forEach(row => {
        const dateEl = row.querySelector('time');
        const nameEl = row.querySelector('td:last-child');
        if (dateEl && nameEl) {
          holidays.push({
            date: dateEl.getAttribute('datetime'),
            name: nameEl.textContent.trim()
          });
        }
      });
      holidaysData[region] = holidays;
    });
    return holidaysData;
  }

  function groupConsecutiveHolidays(holidays) {
    // Group holidays that are on consecutive days
    const grouped = [];
    let temp = [];
    for (let i = 0; i < holidays.length; i++) {
      const curr = holidays[i];
      const prev = holidays[i - 1];
      if (
        prev &&
        (new Date(curr.date) - new Date(prev.date)) / (1000 * 60 * 60 * 24) === 1
      ) {
        if (temp.length === 0) temp.push(prev);
        temp.push(curr);
      } else {
        if (temp.length > 0) {
          grouped.push([...temp]);
          temp = [];
        }
        grouped.push([curr]);
      }
    }
    if (temp.length > 0) grouped.push([...temp]);
    return grouped;
  }

  function renderHolidaysCalendar(targetSelector, articleSelector = '.pending-holidays-2025') {
    const container = document.querySelector(targetSelector);
    if (!container) return;
    container.innerHTML = '';

    const holidaysData = extractHolidaysFromArticle(articleSelector);
    if (!Object.keys(holidaysData).length) {
      container.innerHTML = '<p>No holiday data found.</p>';
      return;
    }

    // Region navigation
    const nav = document.createElement('nav');
    nav.className = 'holidays-calendar-nav';
    nav.setAttribute('aria-label', 'Regions');
    const ul = document.createElement('ul');
    Object.keys(holidaysData).forEach(region => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#${region}-2025">${region}</a>`;
      ul.appendChild(li);
    });
    nav.appendChild(ul);
    container.appendChild(nav);

    // Region sections
    Object.entries(holidaysData).forEach(([region, holidays]) => {
      const section = document.createElement('section');
      section.className = 'holidays-calendar-region';
      section.id = `${region}-2025`;
      section.innerHTML = `<h2>${region} Holidays – 2025</h2>`;
      const grouped = groupConsecutiveHolidays(holidays);
      const grid = document.createElement('div');
      grid.className = 'holidays-calendar-grid';
      grouped.forEach(group => {
        const tile = document.createElement('div');
        tile.className = 'holidays-calendar-tile';
        if (group.length > 1) {
          tile.innerHTML = `<div class="holidays-calendar-dates">${group
          .map(h => `<span>${new Date(h.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>`)
          .join(' & ')}</div><div class="holidays-calendar-names">${group.map(h => h.name).join(' & ')}</div>`;
        } else {
          const h = group[0];
          tile.innerHTML = `<div class="holidays-calendar-dates">${new Date(h.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div><div class="holidays-calendar-names">${h.name}</div>`;
        }
        grid.appendChild(tile);
      });
      section.appendChild(grid);
      container.appendChild(section);
    });
  }

  window.renderHolidaysCalendar = renderHolidaysCalendar;

  // src/dynamicCategoriesNav.js
  // Fetches categories and sections from Zendesk Help Center API and renders them in the header

  const locale =
    (window.HelpCenter &&
      window.HelpCenter.user &&
      window.HelpCenter.user.locale) ||
    document.documentElement.lang ||
    "en-us";
  const API_BASE = `/api/v2/help_center/${locale}`;

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

  function createDropdown(categoriesWithSections, submitRequest) {
    const nav = document.createElement("nav");
    nav.className = "categories-nav";
    nav.setAttribute("aria-label", "Main navigation");
    const ul = document.createElement("ul");
    ul.className = "categories-nav-list";

    categoriesWithSections.forEach((cat) => {
      const li = document.createElement("li");
      li.className = "category-dropdown";
      const btn = document.createElement("button");
      btn.className = "category-toggle";
      btn.setAttribute("aria-haspopup", "true");
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = cat.name;
      btn.onclick = () => {
        menu.classList.toggle("open");
        btn.setAttribute("aria-expanded", menu.classList.contains("open"));
      };
      li.appendChild(btn);

      const menu = document.createElement("ul");
      menu.className = "category-sections-list";
      cat.sections.forEach((section) => {
        const sectionLi = document.createElement("li");
        const sectionA = document.createElement("a");
        sectionA.href = `/hc/${locale}/sections/${section.id}`;
        sectionA.textContent = section.name;
        sectionLi.appendChild(sectionA);
        menu.appendChild(sectionLi);
      });
      li.appendChild(menu);
      ul.appendChild(li);
    });
    if (submitRequest && submitRequest.url) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = submitRequest.url;
      a.textContent = submitRequest.label || "Submit a request";
      a.className = "submit-a-request";
      li.appendChild(a);
      ul.appendChild(li);
    }

    nav.appendChild(ul);
    return nav;
  }

  async function renderDynamicCategoriesNav() {
    const container = document.getElementById("dynamic-categories-nav");
    if (!container) return;
    const categories = await fetchCategories();
    const categoriesWithSections = (
      await Promise.all(
        categories.map(async (cat) => ({
          ...cat,
          sections: await fetchSections(cat.id),
        }))
      )
    ).filter((cat) => cat.sections.length > 0);
    container.innerHTML = "";
    const submitRequest = {
      url: container.dataset.submitRequestUrl,
      label: container.dataset.submitRequestLabel,
    };
    container.appendChild(createDropdown(categoriesWithSections, submitRequest));
  }

  // Optionally, auto-run on DOMContentLoaded
  if (document.readyState !== "loading") {
    renderDynamicCategoriesNav();
  } else {
    document.addEventListener("DOMContentLoaded", renderDynamicCategoriesNav);
  }

  // src/announcements.js
  // Fetches and renders a simple carousel of company announcements

  async function renderAnnouncements() {
    const container = document.getElementById('announcement-carousel');
    if (!container) return;

    const link = document.querySelector('.announcements h2 a');
    const match = link && link.getAttribute('href').match(/sections\/(\d+)/);
    const sectionId = match ? match[1] : null;

    const resp = sectionId
      ? await fetch(`/api/v2/help_center/sections/${sectionId}/articles.json?sort_by=created_at&sort_order=desc&per_page=5`)
      : null;
    const data = resp && (await resp.json());
    const articles = (data && Array.isArray(data.articles)) ? data.articles : [];

    container.innerHTML = '';
    if (!articles.length) {
      container.innerHTML = '<div class="announcement-empty">No announcements found.</div>';
      return;
    }

    articles.forEach((article, index) => {
      const item = document.createElement('div');
      item.className = `carousel-item${index === 0 ? ' active' : ''}`;

      const body = article.body || '';
      const imgMatch = body.match(/<img[^>]+src=["']([^"']+)["']/i);
      const imgTag = imgMatch
        ? `<img src="${imgMatch[1]}" alt="" />`
        : '<span class="carousel-image-placeholder"></span>';
      const captionClass = imgMatch ? 'carousel-caption' : 'carousel-caption no-image';

      item.innerHTML = `
      <a href="${article.html_url}" class="carousel-link">
        ${imgTag}
        <div class="${captionClass}">${article.title}</div>
      </a>
    `;
      container.appendChild(item);
    });

    let current = 0;
    setInterval(() => {
      const items = container.querySelectorAll('.carousel-item');
      if (!items.length) return;
      items[current].classList.remove('active');
      current = (current + 1) % items.length;
      items[current].classList.add('active');
    }, 5000);
  }

  // src/introductions.js
  // Renders a grid of introductions with images and excerpts.

  async function renderIntroductions() {
    const container = document.getElementById('introductions-grid');
    if (!container) return;

    const SECTION_ID = 4964692123039;
    const isSectionPage = window.location.pathname.includes(`/sections/${SECTION_ID}`);
    const perPage = isSectionPage ? 100 : 6;

    const resp = await fetch(
      `/api/v2/help_center/sections/${SECTION_ID}/articles.json?sort_by=created_at&sort_order=desc&per_page=${perPage}`
    );
    const data = await resp.json();
    const articles = Array.isArray(data.articles) ? data.articles : [];

    container.innerHTML = '';
    if (!articles.length) {
      container.innerHTML = '<div class="introductions-empty">No introductions found.</div>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = isSectionPage ? 'introductions-grid-4wide' : 'introductions-grid-3x2';

    articles.forEach(article => {
      const tile = document.createElement('article');
      tile.className = 'intro-item';
      tile.setAttribute('data-article-id', article.id);
      tile.innerHTML = `
      <a href="${article.html_url}">
        <img class="intro-img" src="/assets/image-pending.jpg" alt="Article image" loading="lazy" />
        <h3 class="intro-title">${article.title}</h3>
        <p class="intro-excerpt">Loading preview…</p>
      </a>
    `;
      grid.appendChild(tile);
    });

    container.appendChild(grid);

    const locale =
      (window.HelpCenter && HelpCenter.user && HelpCenter.user.locale) ||
      (function () {
        const m = location.pathname.match(/\/hc\/([^/]+)/);
        return (m && m[1]) || 'en-us';
      })();

    function firstImageSrc(html) {
      const m = html && html.match(/<img[^>]+src=['"]([^'"]+)['"]/i);
      return m ? m[1] : null;
    }

    function stripHtml(html) {
      const tmp = document.createElement('div');
      tmp.innerHTML = html || '';
      return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
    }

    function truncateWords(text, n) {
      const parts = (text || '').split(/\s+/).filter(Boolean);
      if (parts.length <= n) return text || '';
      return parts.slice(0, n).join(' ') + '…';
    }

    const tiles = grid.querySelectorAll('.intro-item');
    tiles.forEach(tile => {
      const id = tile.getAttribute('data-article-id');
      fetch(`/api/v2/help_center/${locale}/articles/${id}.json`)
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          if (!data || !data.article) return;
          const body = data.article.body || '';
          const imgEl = tile.querySelector('.intro-img');
          const src = firstImageSrc(body) || '/assets/image-pending.jpg';
          if (imgEl) imgEl.src = src;
          const p = tile.querySelector('.intro-excerpt');
          if (p) p.textContent = truncateWords(stripHtml(body), 40) || 'No description available.';
        })
        .catch(() => {});
    });

    if (isSectionPage) {
      document.body.classList.add('section-page');
    } else {
      document.body.classList.remove('section-page');
    }
  }

  // src/latestArticles.js
  // Populates the latest articles list in the right rail

  async function renderLatestArticles() {
    const list = document.getElementById("latest-articles-list");
    if (!list) return;

    const categoryId = list.dataset.categoryId;
    const url = categoryId
      ? `/api/v2/help_center/categories/${categoryId}/articles.json?sort_by=created_at&sort_order=desc&per_page=5`
      : "/api/v2/help_center/articles.json?sort_by=created_at&sort_order=desc&per_page=5";
    const resp = await fetch(url);
    const data = await resp.json();
    const articles = Array.isArray(data.articles) ? data.articles : [];

    list.innerHTML = "";
    if (!articles.length) {
      list.innerHTML =
        '<li class="latest-articles-empty">No articles found.</li>';
      return;
    }

    articles.forEach((article) => {
      const li = document.createElement("li");
      li.className = "latest-articles-item";
      li.innerHTML = `
      <a href="${article.html_url}" class="latest-articles-link">
        <span class="latest-articles-title">${article.title}</span>
        <span class="latest-articles-date">${new Date(
          article.created_at
        ).toLocaleDateString()}</span>
      </a>`;
      list.appendChild(li);
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".request-type-label").forEach((el) => {
      const type = el.dataset.requestType || "";
      const slug = type.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (slug) {
        el.classList.add(`request-type-${slug}`);
      }
    });

    const filter = document.getElementById("request-type-filter");
    if (!filter) return;

    const rows = document.querySelectorAll(".requests-table tbody tr");
    const types = new Set();

    rows.forEach((row) => {
      const type = row.dataset.requestType;
      if (type) {
        types.add(type);
      }
    });

    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      filter.appendChild(option);
    });

    filter.addEventListener("change", () => {
      const value = filter.value;
      rows.forEach((row) => {
        if (!value || row.dataset.requestType === value) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  });

  // Initialize announcements, introductions, latest articles and holidays banner
  function initHomepageSections() {
    renderAnnouncements();
    renderIntroductions();
    renderLatestArticles();
    if (
      document.querySelector("#holidays-banner") &&
      document.querySelector(".pending-holidays-2025")
    ) {
      window.renderHolidaysBanner("#holidays-banner");
    }
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initHomepageSections);
  } else {
    initHomepageSections();
  }

  window.addEventListener("DOMContentLoaded", () => {
    // Display request type from custom field 4992033637535 in requests table
    const REQUEST_TYPE_FIELD_ID = "4992033637535";
    document.querySelectorAll(".requests-table tbody tr").forEach(row => {
      // Try to get the custom field value from a data attribute or child element
      let requestType = row.getAttribute(`data-field-${REQUEST_TYPE_FIELD_ID}`) || row.dataset[`field${REQUEST_TYPE_FIELD_ID}`];
      if (!requestType) {
        // Try to find it in a child element
        const fieldCell = row.querySelector(`[data-field-${REQUEST_TYPE_FIELD_ID}]`);
        if (fieldCell) requestType = fieldCell.getAttribute(`data-field-${REQUEST_TYPE_FIELD_ID}`);
      }
      // If found, display it in a new cell or update an existing cell
      if (requestType) {
        let typeCell = row.querySelector(".request-type-cell");
        if (!typeCell) {
          typeCell = document.createElement("td");
          typeCell.className = "request-type-cell";
          row.appendChild(typeCell);
        }
        typeCell.textContent = requestType;
      }
    });
  });

  (function () {
    // ===== CONFIG =============================================================
    const FIELD_ID = null; // e.g., 4992033637535
    const LABELS = {
      offboard: 'Offboard',
      'new-hire': 'New Hire',
      sales_ops: 'SalesOps',
      general_it: 'General IT',
      hardware_request: 'Hardware Request',
      software_request: 'Software Request',
      google_group: 'Google Group'
    };
    // ===== UTILITIES ==========================================================
    const reqCache = new Map();
    function unique(arr) { return Array.from(new Set(arr)); }
    function getRequestIdFromNode(node) {
      const ph = node.querySelector?.('[data-request-id]');
      if (ph) return ph.getAttribute('data-request-id');
      const a = node.querySelector?.('a.striped-list-title, a[href*="/requests/"]');
      if (!a) return null;
      const m = a.getAttribute('href').match(/\/requests\/(\d+)/);
      return m ? m[1] : null;
    }
    async function fetchRequest(id) {
      if (!id) return null;
      if (reqCache.has(id)) return reqCache.get(id);
      const p = fetch(`/api/v2/requests/${id}.json`, { credentials: 'same-origin' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
        .then(j => j && j.request ? j.request : null)
        .catch(() => null);
      reqCache.set(id, p);
      return p;
    }
    function deriveTypeTag(req) {
      if (!req) return null;
      if (Array.isArray(req.tags)) {
        const hit = req.tags.find(t => LABELS[t]);
        if (hit) return hit;
      }
      if (FIELD_ID && Array.isArray(req.custom_fields)) {
        const cf = req.custom_fields.find(f => Number(f.id) === Number(FIELD_ID));
        if (cf && cf.value && LABELS[cf.value]) return cf.value;
      }
      return null;
    }
    function paintBadge(el, tag) {
      if (!el || !tag) return;
      el.dataset.type = tag;
      el.textContent = LABELS[tag] || tag;
      el.hidden = false;
    }
    // ===== DECORATORS =========================================================
    async function decoratePlaceholders(root) {
      const nodes = root.querySelectorAll?.('.badge--type[data-request-id]') || [];
      await Promise.all(Array.from(nodes).map(async el => {
        const id = el.getAttribute('data-request-id');
        const req = await fetchRequest(id);
        const tag = deriveTypeTag(req);
        paintBadge(el, tag);
      }));
    }
    async function decorateBetaTable(root) {
      const rows = root.querySelectorAll?.('table.requests-table tbody tr') || [];
      await Promise.all(Array.from(rows).map(async tr => {
        if (tr.querySelector('.badge--type')) return;
        const id = getRequestIdFromNode(tr);
        if (!id) return;
        const req = await fetchRequest(id);
        const tag = deriveTypeTag(req);
        if (!tag) return;
        const a = tr.querySelector('a.striped-list-title, a[href*="/requests/"]');
        if (!a) return;
        const span = document.createElement('span');
        span.className = 'badge badge--type';
        span.setAttribute('data-type', tag);
        span.textContent = LABELS[tag] || tag;
        a.insertAdjacentElement('afterend', span);
      }));
    }
    function setupTypeFilter(root) {
      const select = document.getElementById('request-type-filter');
      if (!select) return;
      const types = unique(Array.from(root.querySelectorAll('.badge--type:not([hidden])'))
        .map(b => b.getAttribute('data-type'))
        .filter(Boolean)).sort();
      const existing = new Set(Array.from(select.options).map(o => o.value));
      types.forEach(t => {
        if (existing.has(t)) return;
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = LABELS[t] || t;
        select.appendChild(opt);
      });
      select.addEventListener('change', () => {
        const chosen = select.value;
        (root.querySelectorAll('table.requests-table tbody tr') || []).forEach(tr => {
          const b = tr.querySelector('.badge--type:not([hidden])');
          const t = b ? b.getAttribute('data-type') : null;
          tr.style.display = (!chosen || t === chosen) ? '' : 'none';
        });
      }, { once: true });
    }
    // ===== INIT + OBSERVER ====================================================
    const root = document.getElementById('main-content') || document;
    function runAll() {
      decoratePlaceholders(root)
        .then(() => decorateBetaTable(root))
        .then(() => setupTypeFilter(root));
    }
    runAll();
    const obs = new MutationObserver(() => runAll());
    obs.observe(root, { childList: true, subtree: true });
  })();
})();


(function () {
  // ===== CONFIG =============================================================
  // Optional: if you want to FALL BACK to a specific custom field when tags aren't found,
  // set FIELD_ID to the numeric id of your tagger field; otherwise leave null.
  const FIELD_ID = null; // e.g., 4992033637535

  // Tag -> pretty label
  const LABELS = {
    offboard: 'Offboard',
    'new-hire': 'New Hire',
    sales_ops: 'SalesOps',
    general_it: 'General IT',
    hardware_request: 'Hardware Request',
    software_request: 'Software Request',
    google_group: 'Google Group'
  };

  // ===== UTILITIES ==========================================================
  const reqCache = new Map();
  function unique(arr) { return Array.from(new Set(arr)); }

  function getRequestIdFromNode(node) {
    // Preferred: placeholder attribute
    const ph = node.querySelector?.('[data-request-id]');
    if (ph) return ph.getAttribute('data-request-id');

    // Fallback: parse subject link
    const a = node.querySelector?.('a.striped-list-title, a[href*="/requests/"]');
    if (!a) return null;
    const m = a.getAttribute('href').match(/\/requests\/(\d+)/);
    return m ? m[1] : null;
  }

  async function fetchRequest(id) {
    if (!id) return null;
    if (reqCache.has(id)) return reqCache.get(id);

    const p = fetch(`/api/v2/requests/${id}.json`, { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(j => j && j.request ? j.request : null)
      .catch(() => null);

    reqCache.set(id, p);
    return p;
  }

  function deriveTypeTag(req) {
    if (!req) return null;

    // 1) Prefer tags
    if (Array.isArray(req.tags)) {
      const hit = req.tags.find(t => LABELS[t]);
      if (hit) return hit;
    }

    // 2) Optional fallback: a specific custom field (if you set FIELD_ID)
    if (FIELD_ID && Array.isArray(req.custom_fields)) {
      const cf = req.custom_fields.find(f => Number(f.id) === Number(FIELD_ID));
      if (cf && cf.value && LABELS[cf.value]) return cf.value;
    }

    return null;
  }

  function paintBadge(el, tag) {
    if (!el || !tag) return;
    el.dataset.type = tag;
    el.textContent = LABELS[tag] || tag;
    el.hidden = false;
  }

  // ===== DECORATORS =========================================================
  async function decoratePlaceholders(root) {
    const nodes = root.querySelectorAll?.('.badge--type[data-request-id]') || [];
    await Promise.all(Array.from(nodes).map(async el => {
      const id = el.getAttribute('data-request-id');
      const req = await fetchRequest(id);
      const tag = deriveTypeTag(req);
      paintBadge(el, tag);
    }));
  }

  async function decorateBetaTable(root) {
    // For beta request_list (no placeholders), inject badges after the subject link
    const rows = root.querySelectorAll?.('table.requests-table tbody tr') || [];
    await Promise.all(Array.from(rows).map(async tr => {
      if (tr.querySelector('.badge--type')) return; // already present
      const id = getRequestIdFromNode(tr);
      if (!id) return;
      const req = await fetchRequest(id);
      const tag = deriveTypeTag(req);
      if (!tag) return;

      const a = tr.querySelector('a.striped-list-title, a[href*="/requests/"]');
      if (!a) return;
      const span = document.createElement('span');
      span.className = 'badge badge--type';
      span.setAttribute('data-type', tag);
      span.textContent = LABELS[tag] || tag;
      a.insertAdjacentElement('afterend', span);
    }));
  }

  function setupTypeFilter(root) {
    const select = document.getElementById('request-type-filter');
    if (!select) return;

    // Populate with types present on page
    const types = unique(Array.from(root.querySelectorAll('.badge--type:not([hidden])'))
      .map(b => b.getAttribute('data-type'))
      .filter(Boolean)).sort();

    const existing = new Set(Array.from(select.options).map(o => o.value));
    types.forEach(t => {
      if (existing.has(t)) return;
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = LABELS[t] || t;
      select.appendChild(opt);
    });

    // Filter rows
    select.addEventListener('change', () => {
      const chosen = select.value;
      (root.querySelectorAll('table.requests-table tbody tr') || []).forEach(tr => {
        const b = tr.querySelector('.badge--type:not([hidden])');
        const t = b ? b.getAttribute('data-type') : null;
        tr.style.display = (!chosen || t === chosen) ? '' : 'none';
      });
    }, { once: true });
  }

  // ===== INIT + OBSERVER ====================================================
  function runAll() {
    const root = document.getElementById('main-content') || document;
    decoratePlaceholders(root)
      .then(() => decorateBetaTable(root))
      .then(() => setupTypeFilter(root));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAll);
  } else {
    runAll();
  }

  const root = document.getElementById('main-content') || document;
  const obs = new MutationObserver(runAll);
  obs.observe(root, { childList: true, subtree: true });
})();
