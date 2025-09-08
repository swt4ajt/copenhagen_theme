import "../styles/index.scss";

import "./navigation";
import "./dropdowns";
import "./share";
import "./search";
import "./forms";
import "./carousel";
import "./departments";
import "./modules/theme-toggle";
import "./requestFormsList";
import "./holidaysCalendar";
import "./dynamicCategoriesNav";
import "./announcements";
import "./introductions";
import "./latestArticles";

// Initialize holidays notification banner on category pages
window.addEventListener("DOMContentLoaded", () => {
  if (
    document.querySelector("#holidays-banner") &&
    document.querySelector(".pending-holidays-2025")
  ) {
    window.renderHolidaysBanner("#holidays-banner");
  }
});
