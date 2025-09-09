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
import { renderAnnouncements } from './announcements';
import { renderIntroductions } from './introductions';
import { renderLatestArticles } from './latestArticles';
import "./requestTypes";

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
