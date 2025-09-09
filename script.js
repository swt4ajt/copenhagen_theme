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
    // In some cases we should preserve focus after page reload
    returnFocus();

    // show form controls when the textarea receives focus or back button is used and value exists
    const commentContainerTextarea = document.querySelector(
      ".comment-container textarea"
    );
    const commentContainerFormControls = document.querySelector(
      ".comment-form-controls, .comment-ccs"
    );

    if (commentContainerTextarea) {
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

    if (showRequestCommentContainerTrigger) {
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

    function isEmptyPlaintext(s) {
      return s.trim() === "";
    }

    function isEmptyHtml(xml) {
      const doc = new DOMParser().parseFromString(`<_>${xml}</_>`, "text/xml");
      const img = doc.querySelector("img");
      return img === null && isEmptyPlaintext(doc.children[0].textContent);
    }

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

      // Hide subject and description fields
      if (subjectInput)
        subjectInput
          .closest(".form-field, .form-group, .form-control, label")
          ?.style.setProperty("display", "none", "important");
      if (descriptionInput)
        descriptionInput
          .closest(".form-field, .form-group, .form-control, label")
          ?.style.setProperty("display", "none", "important");

      // On form submit, prefill subject and description
      const requestForm = document.querySelector("form[data-ticket-form-id]");
      if (requestForm) {
        requestForm.addEventListener(
          "submit",
          function () {
            if (subjectInput) subjectInput.value = subjectMap[formId];
            if (descriptionInput) descriptionInput.value = descriptionMap[formId];
          },
          true
        );
      }
    }

    // --- Zendesk new-request-form: Robust prefill/hide for forms 4959432829215 and 4959424709919 ---
    function robustPrefillAndHideZendeskFields() {
      const form = document.querySelector('form[action="/hc/en-gb/requests"]');
      if (!form) return;
      const formIdInput = form.querySelector('input[name="request[ticket_form_id]"]');
      if (!formIdInput) return;
      const formId = formIdInput.value;
      let firstNameInput, lastNameInput, subjectInput, descriptionInput;
      if (formId === '4959432829215') {
        firstNameInput = form.querySelector('input[name^="request[custom_fields][4959434786335]"]');
        lastNameInput = form.querySelector('input[name^="request[custom_fields][4959434835359]"]');
      } else if (formId === '4959424709919') {
        firstNameInput = form.querySelector('input[name^="request[custom_fields][4959424710327]"]');
        lastNameInput = form.querySelector('input[name^="request[custom_fields][4959424710337]"]');
      } else {
        return;
      }
      subjectInput = form.querySelector('input[name="request[subject]"]');
      descriptionInput = form.querySelector('textarea[name="request[description]"]');
      if (!firstNameInput || !lastNameInput || !subjectInput || !descriptionInput) return;
      const fullName = `${firstNameInput.value} ${lastNameInput.value}`.trim();
      subjectInput.value = fullName;
      descriptionInput.value = `Submitted by: ${fullName}`;
      subjectInput.closest('.form-field, .form-group, .form-control, label')?.style.setProperty('display', 'none', 'important');
      descriptionInput.closest('.form-field, .form-group, .form-control, label')?.style.setProperty('display', 'none', 'important');
      form.addEventListener('submit', function(e) {
        const fullName = `${firstNameInput.value} ${lastNameInput.value}`.trim();
        subjectInput.value = fullName;
        descriptionInput.value = `Submitted by: ${fullName}`;
      }, true);
    }
    // MutationObserver to watch for form and fields
    const zendeskFormObserver = new MutationObserver(() => {
      robustPrefillAndHideZendeskFields();
    });
    zendeskFormObserver.observe(document.body, { childList: true, subtree: true });
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
        if (temp.length === 0) {
          temp.push(prev);
        }
        temp.push(curr);
      } else {
        if (temp.length > 0) {
          grouped.push(temp);
          temp = [];
        }
        grouped.push([curr]);
      }
    }
    if (temp.length > 0) {
      grouped.push(temp);
    }
    return grouped;
  }

  function renderHolidaysCalendar(targetSelector) {
    const holidaysData = extractHolidaysFromArticle('.article');
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) return;

    Object.keys(holidaysData).forEach(region => {
      const regionHolidays = holidaysData[region];
      const groupedHolidays = groupConsecutiveHolidays(regionHolidays);

      const regionContainer = document.createElement('div');
      regionContainer.className = 'holidays-region';
      const regionTitle = document.createElement('h3');
      regionTitle.className = 'holidays-region-title';
      regionTitle.textContent = region;
      regionContainer.appendChild(regionTitle);

      groupedHolidays.forEach(holidayGroup => {
        const groupEl = document.createElement('div');
        groupEl.className = 'holiday-group';
        const dates = holidayGroup.map(holiday => new Date(holiday.date));
        const startDate = new Date(Math.min.apply(null, dates));
        const endDate = new Date(Math.max.apply(null, dates));
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const dateLabel = document.createElement('div');
        dateLabel.className = 'holiday-date';
        dateLabel.textContent = `${startDate.toLocaleDateString(undefined, dateOptions)} - ${endDate.toLocaleDateString(undefined, dateOptions)}`;
        groupEl.appendChild(dateLabel);

        holidayGroup.forEach(holiday => {
          const holidayEl = document.createElement('div');
          holidayEl.className = 'holiday';
          holidayEl.textContent = holiday.name;
          groupEl.appendChild(holidayEl);
        });

        regionContainer.appendChild(groupEl);
      });

      targetElement.appendChild(regionContainer);
    });
  }

  // Call the render function for the holidays calendar
  renderHolidaysCalendar('.holidays-calendar');
})();
