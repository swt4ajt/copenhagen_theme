// Focus management for forms
const key = "returnFocusTo";

export function saveFocus() {
  const activeElementId = document.activeElement.getAttribute("id");
  sessionStorage.setItem(key, "#" + activeElementId);
}

export function returnFocus() {
  const returnFocusTo = sessionStorage.getItem(key);
  if (returnFocusTo) {
    sessionStorage.removeItem("returnFocusTo");
    const returnFocusToEl = document.querySelector(returnFocusTo);
    returnFocusToEl && returnFocusToEl.focus && returnFocusToEl.focus();
  }
}

export function initFocus() {
  window.addEventListener("DOMContentLoaded", () => {
    returnFocus();
  });
}

