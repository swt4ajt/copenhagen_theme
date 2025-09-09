// Navigation and collapsible sidebar logic
export const ENTER = 13;
export const ESCAPE = 27;

export function toggleNavigation(toggle, menu) {
  const isExpanded = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", !isExpanded);
  toggle.setAttribute("aria-expanded", !isExpanded);
}

export function closeNavigation(toggle, menu) {
  menu.setAttribute("aria-expanded", false);
  toggle.setAttribute("aria-expanded", false);
  toggle.focus();
}

export function initNavigation() {
  window.addEventListener("DOMContentLoaded", () => {
    try {
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
      const collapsible = document.querySelectorAll(
        ".collapsible-nav, .collapsible-sidebar"
      );
      collapsible.forEach((element) => {
        const toggle = element.querySelector(
          ".collapsible-nav-toggle, .collapsible-sidebar-toggle"
        );
        if (toggle) {
          element.addEventListener("click", () => {
            toggleNavigation(toggle, element);
          });
          element.addEventListener("keyup", (event) => {
            if (event.keyCode === ESCAPE) {
              closeNavigation(toggle, element);
            }
          });
        }
      });
    } catch (err) {
      console.error("Navigation init error:", err);
    }
    // MutationObserver for async nav rendering
    const navObserver = new MutationObserver(() => {
      try {
        const menuButton = document.querySelector(".header .menu-button-mobile");
        const menuList = document.querySelector("#user-nav-mobile");
        if (menuButton && menuList && !menuButton.hasAttribute("data-nav-init")) {
          menuButton.setAttribute("data-nav-init", "true");
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
      } catch (err) {
        console.error("Navigation observer error:", err);
      }
    });
    navObserver.observe(document.body, { childList: true, subtree: true });
  });
}
