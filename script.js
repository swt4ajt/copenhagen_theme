(function () {
  'use strict';

  // Key map
  const ENTER = 13;
  const ESCAPE = 27;

  function toggleNavigation(toggle, menu) {
    const isExpanded = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", !isExpanded);
    toggle.setAttribute("aria-expanded", !isExpanded);
  }

  function closeNavigation(toggle, menu) {
    menu.setAttribute("aria-expanded", false);
    toggle.setAttribute("aria-expanded", false);
    toggle.focus();
  }

  // Navigation

  window.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector(".header .menu-button-mobile");
    const menuList = document.querySelector("#user-nav-mobile");

    if (menuButton && menuList) {
      menuButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleNavigation(menuButton, menuList);
      });

      menuList.addEventListener("keyup", (event) => {
        if (event.keyCode === ESCAPE) {
          event.stopPropagation();
          closeNavigation(menuButton, menuList);
        }
      });
    }

    // Toggles expanded aria to collapsible elements
    const collapsible = document.querySelectorAll(".collapsible-nav, .collapsible-sidebar");

    collapsible.forEach((element) => {
      const toggle = element.querySelector(".collapsible-nav-toggle, .collapsible-sidebar-toggle");
      if (!toggle) return;

      element.addEventListener("click", () => {
        toggleNavigation(toggle, element);
      });

      element.addEventListener("keyup", (event) => {
        if (event.keyCode === ESCAPE) {
          event.stopPropagation();
          closeNavigation(toggle, element);
        }
      });
    });

    // If multibrand search has more than 5 help centers or categories collapse the list
    const multibrandFilterLists = document.querySelectorAll(".multibrand-filter-list");
    multibrandFilterLists.forEach((filter) => {
      if (filter.children.length > 6) {
        const trigger = filter.querySelector(".see-all-filters");
        if (!trigger) return;
        trigger.setAttribute("aria-hidden", false);
        trigger.addEventListener("click", (event) => {
          event.stopPropagation();
          trigger.parentNode.removeChild(trigger);
          filter.classList.remove("multibrand-filter-list--collapsed");
        });
      }
    });
  });

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
      if (index === -1) index = itemChars.indexOf(char, 0);
      if (index > -1) this.focusByIndex(index);
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

      if (e.ctrlKey || e.altKey || e.metaKey) return;

      switch (key) {
        case "Esc":
        case "Escape": {
          e.stopPropagation();
          e.preventDefault();
          this.dismiss();
          this.toggle.focus();
          break;
        }
        case "ArrowDown":
        case "Down": {
          e.stopPropagation();
          e.preventDefault();
          this.focusNextMenuItem(currentElement);
          break;
        }
        case "ArrowUp":
        case "Up": {
          e.stopPropagation();
          e.preventDefault();
          this.focusPreviousMenuItem(currentElement);
          break;
        }
        case "Home":
        case "PageUp": {
          e.stopPropagation();
          e.preventDefault();
          this.focusFirstMenuItem();
          break;
        }
        case "End":
        case "PageDown": {
          e.stopPropagation();
          e.preventDefault();
          this.focusLastMenuItem();
          break;
        }
        case "Tab": {
          if (e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            this.dismiss();
            this.toggle.focus();
          } else {
            this.dismiss();
          }
          break;
        }
        default: {
          if (isPrintableChar(key)) {
            e.stopPropagation();
            e.preventDefault();
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

  // Share

  window.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".share a");
    links.forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        event.preventDefault();
        window.open(anchor.href, "", "height=500,width=500");
      });
    });
  });

  // Vanilla JS debounce
  function debounce(callback, wait) {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  }

  // Search helpers
  let searchFormFilledClassName = "search-has-value";
  let searchFormSelector = "form[role='search']";

  function clearSearchInput(event) {
    event.target.closest(searchFormSelector).classList.remove(searchFormFilledClassName);

    let input;
    if (event.target.tagName === "INPUT") {
      input = event.target;
    } else if (event.target.tagName === "BUTTON") {
      input = event.target.previousElementSibling;
    } else {
      input = event.target.closest("button").previousElementSibling;
    }
    input.value = "";
    input.focus();
  }

  function clearSearchInputOnKeypress(event) {
    const searchInputDeleteKeys = ["Delete", "Escape"];
    if (searchInputDeleteKeys.includes(event.key)) {
      clearSearchInput(event);
    }
  }

  function buildClearSearchButton(inputId) {
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("aria-controls", inputId);
    button.classList.add("clear-button");
    const buttonLabel = window.searchClearButtonLabelLocalized;
    const icon = `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' focusable='false' role='img' viewBox='0 0 12 12' aria-label='${buttonLabel}'><path stroke='currentColor' stroke-linecap='round' stroke-width='2' d='M3 9l6-6m0 6L3 3'/></svg>`;
    button.innerHTML = icon;
    button.addEventListener("click", clearSearchInput);
    button.addEventListener("keyup", clearSearchInputOnKeypress);
    return button;
  }

  function appendClearSearchButton(input, form) {
    const searchClearButton = buildClearSearchButton(input.id);
    form.append(searchClearButton);
    if (input.value.length > 0) {
      form.classList.add(searchFormFilledClassName);
    }
  }

  const toggleClearSearchButtonAvailability = debounce((event) => {
    const form = event.target.closest(searchFormSelector);
    form.classList.toggle(searchFormFilledClassName, event.target.value.length > 0);
  }, 200);

  // Search

  window.addEventListener("DOMContentLoaded", () => {
    const searchForms = [...document.querySelectorAll(searchFormSelector)];
    const searchInputs = searchForms.map((form) => form.querySelector("input[type='search']"));
    searchInputs.forEach((input) => {
      if (!input) return;
      appendClearSearchButton(input, input.closest(searchFormSelector));
      input.addEventListener("keyup", clearSearchInputOnKeypress);
      input.addEventListener("keyup", toggleClearSearchButtonAvailability);
    });
  });

  const key = "returnFocusTo";

  function saveFocus() {
    const activeElementId = document.activeElement.getAttribute("id");
    if (activeElementId) sessionStorage.setItem(key, "#" + activeElementId);
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
    // preserve focus after page reload
    returnFocus();

    const commentContainerTextarea = document.querySelector(".comment-container textarea");
    const commentContainerFormControls = document.querySelector(".comment-form-controls, .comment-ccs");

    if (commentContainerTextarea && commentContainerFormControls) {
      commentContainerTextarea.addEventListener("focus", function focusCommentContainerTextarea() {
        commentContainerFormControls.style.display = "block";
        commentContainerTextarea.removeEventListener("focus", focusCommentContainerTextarea);
      });

      if (commentContainerTextarea.value !== "") {
        commentContainerFormControls.style.display = "block";
      }
    }

    const showRequestCommentContainerTrigger = document.querySelector(".request-container .comment-container .comment-show-container");
    const requestCommentFields = document.querySelectorAll(".request-container .comment-container .comment-fields");
    const requestCommentSubmit = document.querySelector(".request-container .comment-container .request-submit-comment");

    if (showRequestCommentContainerTrigger) {
      showRequestCommentContainerTrigger.addEventListener("click", () => {
        showRequestCommentContainerTrigger.style.display = "none";
        Array.prototype.forEach.call(requestCommentFields, (element) => {
          element.style.display = "block";
        });
        if (requestCommentSubmit) requestCommentSubmit.style.display = "inline-block";
        if (commentContainerTextarea) commentContainerTextarea.focus();
      });
    }

    const requestMarkAsSolvedButton = document.querySelector(".request-container .mark-as-solved:not([data-disabled])");
    const requestMarkAsSolvedCheckbox = document.querySelector(".request-container .comment-container input[type=checkbox]");
    const requestCommentSubmitButton = document.querySelector(".request-container .comment-container input[type=submit]");

    if (requestMarkAsSolvedButton && requestMarkAsSolvedCheckbox && requestCommentSubmitButton) {
      requestMarkAsSolvedButton.addEventListener("click", () => {
        requestMarkAsSolvedCheckbox.setAttribute("checked", true);
        requestCommentSubmitButton.disabled = true;
        requestMarkAsSolvedButton.setAttribute("data-disabled", true);
        requestMarkAsSolvedButton.form.submit();
      });
    }

    const requestCommentTextarea = document.querySelector(".request-container .comment-container textarea");
    const usesWysiwyg = requestCommentTextarea && requestCommentTextarea.dataset.helper === "wysiwyg";

    function isEmptyPlaintext(s) {
      return (s || "").trim() === "";
    }

    function isEmptyHtml(xml) {
      const doc = new DOMParser().parseFromString(`<_>${xml}</_>`, "text/xml");
      const img = doc.querySelector("img");
      return img === null && isEmptyPlaintext(doc.children[0].textContent || "");
    }

    const isEmpty = usesWysiwyg ? isEmptyHtml : isEmptyPlaintext;

    if (requestCommentTextarea && requestMarkAsSolvedButton) {
      requestCommentTextarea.addEventListener("input", () => {
        if (isEmpty(requestCommentTextarea.value)) {
          requestMarkAsSolvedButton.innerText = requestMarkAsSolvedButton.getAttribute("data-solve-translation");
        } else {
          requestMarkAsSolvedButton.innerText = requestMarkAsSolvedButton.getAttribute("data-solve-and-submit-translation");
        }
      });
    }

    const selects = document.querySelectorAll("#request-status-select, #request-organization-select");
    selects.forEach((element) => {
      element.addEventListener("change", (event) => {
        event.stopPropagation();
        saveFocus();
        element.form.submit();
      });
    });

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

    const requestOrganisationSelect = document.querySelector("#request-organization select");
    if (requestOrganisationSelect) {
      requestOrganisationSelect.addEventListener("change", () => {
        requestOrganisationSelect.form.submit();
      });

      requestOrganisationSelect.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    const notificationElm = document.querySelector(".notification-error");
    if (
      notificationElm &&
      notificationElm.previousElementSibling &&
      typeof notificationElm.previousElementSibling.focus === "function"
    ) {
      notificationElm.previousElementSibling.focus();
    }
  });

  // --- Announcements + Introductions loaders (clean + safe) ---

  (function () {

    // Helpers
    const extractFirstImage = (html = "") => {
      const m = html.match(/<img[^>]+src="([^"]+)"/i);
      return m ? m[1] : null;
    };

    const stripHtml = (html = "") => html.replace(/<[^>]+>/g, "");
    const truncateWords = (text = "", n = 20) =>
      text.split(/\s+/).filter(Boolean).slice(0, n).join(" ");

    // NEW: locale + full article fetch helpers
    function getLocale() {
      return (window.HelpCenter && HelpCenter.user && HelpCenter.user.locale)
        || (location.pathname.match(/\/hc\/([^/]+)/) || [,"en-us"])[1];
    }

    async function fetchArticleFull(locale, id) {
      const res = await fetch(`/api/v2/help_center/${locale}/articles/${id}.json`);
      if (!res.ok) return null;
      return res.json().catch(() => null);
    }

    // --- Announcements (label: Announcements) ---
    async function loadAnnouncements() {
      const container = document.querySelector("#announcement-carousel");
      const list = document.querySelector("#announcement-list");
      if (!container && !list) return;

      const locale = getLocale();

      let data;
      try {
        const resp = await fetch(
          "/api/v2/help_center/articles.json?label_names=Announcements&per_page=4&sort_by=created_at&sort_order=desc"
        );
        data = await resp.json();
      } catch { data = null; }

      const articles = Array.isArray(data?.articles) ? data.articles : [];
      if (!articles.length) return;

      if (container) container.innerHTML = "";
      if (list) list.innerHTML = "";

      for (let i = 0; i < articles.length; i++) {
        const a = articles[i];
        const url = a.html_url || a.url || "#";
        const title = a.title || "";

        // Hydrate full body for image/text
        let body = "";
        try {
          const full = await fetchArticleFull(locale, a.id);
          body = full?.article?.body || "";
        } catch { /* ignore */ }

        const imgUrl = extractFirstImage(body);
        const text = truncateWords(stripHtml(body), 24);

        if (container) {
          const div = document.createElement("div");
          div.className = "carousel-item" + (i === 0 ? " active" : "");
          div.innerHTML = `
            <a href="${url}" class="carousel-link">
              <img src="${imgUrl || '/assets/Image_not_available.png'}" alt="${title}">
              <span class="carousel-caption">${title}</span>
            </a>`;
          container.appendChild(div);
        }

        if (list) {
          const li = document.createElement("li");
          li.className = "announcement-item";
          li.innerHTML = `<a href="${url}">${title}</a>`;
          list.appendChild(li);
        }
      }

      // simple rotation if desired
      if (container && container.children.length) {
        let index = 0;
        const items = Array.from(container.children);
        items[0].classList.add("active");
        setInterval(() => {
          items[index].classList.remove("active");
          index = (index + 1) % items.length;
          items[index].classList.add("active");
        }, 5000);
      }
    }

    /**
     * Small Introductions block (optional legacy list by label)
     * Data source: articles labeled "introductions"
     */
    async function loadIntroductions() {
      const container = document.querySelector("#introductions-carousel");
      const list = document.querySelector("#introductions-list");
      if (!container && !list) return;

      const locale = getLocale();

      try {
        const resp = await fetch(
          "/api/v2/help_center/articles.json?label_names=introductions&per_page=5&sort_by=created_at&sort_order=desc"
        );
        const data = await resp.json().catch(() => null);
        if (!data || !Array.isArray(data.articles)) return;

        for (const article of data.articles) {
          let body = "";
          try {
            const full = await fetchArticleFull(locale, article.id);
            body = full?.article?.body || "";
          } catch { /* ignore */ }

          const title = article.title || "";
          const url = article.html_url || "#";
          const imgUrl = extractFirstImage(body);
          const imgTag = imgUrl ? `<img src="${imgUrl}" alt="${title}">` : "";
          const text = truncateWords(stripHtml(body), 20);

          if (container) {
            const div = document.createElement("div");
            div.className = "intro-item";
            div.innerHTML = `<a href="${url}">${imgTag}<h3>${title}</h3><p>${text}...</p></a>`;
            container.appendChild(div);
          }

          if (list) {
            const li = document.createElement("li");
            li.className = "introduction-item";
            li.textContent = title;
            list.appendChild(li);
          }
        }
      } catch {
        /* ignore */
      }
    }

    /**
     * Full Introductions section tiles:
     * - Replaces the default `.article-list` with a grid of tiles for section 4964692123039
     */
    async function loadIntroductionTiles() {
      if (!window.location.href.includes("4964692123039-Introductions")) return;

      const list = document.querySelector(".article-list");
      if (!list) return;

      // Hide standard list and append grid
      list.style.display = "none";
      const container = document.createElement("div");
      container.id = "introductions-grid";
      list.parentNode.appendChild(container);

      try {
        const resp = await fetch(
          `/api/v2/help_center/sections/4964692123039/articles.json?per_page=6&sort_by=created_at&sort_order=desc`
        );
        const data = await resp.json().catch(() => null);
        if (!data || !Array.isArray(data.articles)) return;

        for (const article of data.articles.slice(0, 6)) {
          const title = article.title || "";
          const url = article.html_url || "#";

          // fetch full body for image + text
          let body = "";
          try {
            const full = await fetchArticleFull(getLocale(), article.id);
            body = full?.article?.body || "";
          } catch { /* ignore */ }

          const img = extractFirstImage(body) || "/assets/Image_not_available.png";
          const text = truncateWords(stripHtml(body), 20);

          const div = document.createElement("div");
          div.className = "intro-item";
          div.innerHTML = `<a href="${url}"><img src="${img}" alt="${title}"><h3>${title}</h3><p>${text}...</p></a>`;
          container.appendChild(div);
        }
      } catch {
        /* ignore */
      }
    }

    // Homepage introductions grid (3×2 from section 4964692123039)
    async function loadHomeIntroductionsGrid() {
      const container = document.querySelector("#introductions-grid");
      if (!container) return;

      const locale = getLocale();

      // 1) Get the latest 6 from the section (list payload; no bodies)
      let list;
      try {
        const resp = await fetch(
          `/api/v2/help_center/sections/4964692123039/articles.json?per_page=6&sort_by=created_at&sort_order=desc`
        );
        list = await resp.json();
      } catch {
        list = null;
      }
      const articles = Array.isArray(list?.articles) ? list.articles.slice(0, 6) : [];
      if (!articles.length) return;

      // 2) Render placeholders first (fast paint)
      container.innerHTML = articles.map(a => `
        <article class="intro-item" data-article-id="${a.id}">
          <a href="${a.html_url || a.url || '#'}">
            <img src="/assets/Image_not_available.png" alt="" class="intro-img">
            <h3 class="intro-title">${a.title || ''}</h3>
            <p class="intro-excerpt">${a.excerpt || 'Loading…'}</p>
          </a>
        </article>
      }).join("");

      // 3) Hydrate each card with real body -> image + better excerpt
      for (const a of articles) {
        const tile = container.querySelector(`.intro-item[data-article-id="${a.id}"]`);
        if (!tile) continue;

        try {
          const data = await fetchArticleFull(locale, a.id);
          const body = data?.article?.body || "";
          const img = extractFirstImage(body);
          const txt = truncateWords(stripHtml(body), 40);

          const imgEl = tile.querySelector(".intro-img");
          if (imgEl && img) imgEl.src = img;

          const p = tile.querySelector(".intro-excerpt");
          if (p) p.textContent = txt || a.excerpt || "No description available.";
        } catch {
          /* soft-fail per tile */
        }
      }
    }

    // Bootstrap
    function init() {
      loadAnnouncements();
      loadIntroductions();
      loadIntroductionTiles();
      loadHomeIntroductionsGrid();
    }

    document.addEventListener("DOMContentLoaded", init);
  })();

  async function loadDepartments() {
    const list = document.querySelector(".department-rail .blocks-list");
    if (!list) return;
    try {
      const resp = await fetch("/api/v2/help_center/categories/4961264026655/sections.json");
      const data = await resp.json();
      (data.sections || []).forEach((section) => {
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
    if (!container) return;

    const dataUrl = container.dataset.forms;

    fetch(dataUrl)
      .then((response) => response.json())
      .then((forms) => {
        forms.forEach((form) => {
          const card = document.createElement("div");
          card.className = "request-form-card";
          card.innerHTML = `
            <h3>${form.name}</h3>
            <p>${form.description}</p>
            <a href="/forms/${form.id}" class="request-form-link">Open</a>
          `;
          container.appendChild(card);
        });
      })
      .catch((error) => {
        console.error("Failed to load request forms:", error);
      });
  });


  // ---- Latest 5 Articles (Home) --------------------------------------------
  (function () {
    'use strict';

    async function fetchLatestArticles(limit = 5) {
      const url = `/api/v2/help_center/articles.json?sort_by=created_at&sort_order=desc&per_page=${encodeURIComponent(limit)}`;
      const resp = await fetch(url, { credentials: 'same-origin' });
      if (!resp.ok) throw new Error(`Latest articles request failed: ${resp.status}`);
      return resp.json();
    }

    function formatDate(iso) {
      try {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      } catch {
        return iso;
      }
    }

    function renderLatestArticles(data) {
      const list = document.getElementById('latest-articles-list');
      if (!list) return;

      const articles = Array.isArray(data?.articles) ? data.articles : [];
      list.innerHTML = '';

      if (!articles.length) {
        list.innerHTML = `<li class="latest-articles-empty">No recent articles yet.</li>`;
        return;
      }

      const frag = document.createDocumentFragment();

      articles.slice(0, 5).forEach((a) => {
        const li = document.createElement('li');
        li.className = 'latest-articles-item';

        const href = a.html_url || '#';
        const created = formatDate(a.created_at);

        li.innerHTML = `
          <a class="latest-articles-link" href="${href}">
            <span class="latest-articles-title">${a.title || 'Untitled article'}</span>
            <time class="latest-articles-date" datetime="${a.created_at}">${created}</time>
          </a>
        `;
        frag.appendChild(li);
      });

      list.appendChild(frag);
    }

    async function initLatestArticles() {
      const list = document.getElementById('latest-articles-list');
      if (!list) return;

      list.innerHTML = `<li class="latest-articles-loading">Loading…</li>`;

      try {
        const data = await fetchLatestArticles(5);
        renderLatestArticles(data);
      } catch (err) {
        console.error(err);
        list.innerHTML = `<li class="latest-articles-error">Couldn’t load latest articles.</li>`;
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initLatestArticles);
    } else {
      initLatestArticles();
    }
  })();
})();
