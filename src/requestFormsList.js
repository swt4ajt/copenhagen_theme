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
