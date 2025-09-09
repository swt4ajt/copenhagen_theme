window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("request-form-container");
  if (!container) {
    return;
  }

  const dataUrl = container.dataset.forms || "/api/v2/ticket_forms.json";

  fetch(dataUrl)
    .then((response) => response.json())
    .then((data) => {
      const forms = data.ticket_forms || data.forms || [];
      forms.forEach((form) => {
        const card = document.createElement("div");
        card.className = "request-form-card";
        const description = form.description ? `<p>${form.description}</p>` : "";
        card.innerHTML = `
          <h3>${form.name}</h3>
          ${description}
          <a href="${window.location.pathname}?ticket_form_id=${form.id}" class="request-form-link">Open</a>
        `;
        container.appendChild(card);
      });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to load request forms:", error);
    });
});
