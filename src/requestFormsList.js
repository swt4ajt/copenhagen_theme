window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("request-form-container");
  if (!container) {
    return;
  }

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
      // eslint-disable-next-line no-console
      console.error("Failed to load request forms:", error);
    });
});
