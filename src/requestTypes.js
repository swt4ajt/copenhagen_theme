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
