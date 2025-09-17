const FALLBACK_MESSAGE = "Security task details are currently unavailable.";

const TASKS = [
  { key: "security_training_status", label: "Security Training" },
  { key: "device_monitor", label: "Device Monitor" },
  { key: "accepted_policy", label: "Accepted Policy" },
];

const ICON_TEMPLATES = {
  COMPLETE: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3.5 8.5l2.5 2.5 6-6"
      />
    </svg>
  `,
  DUE_SOON: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        stroke-linejoin="round"
        stroke-width="1.8"
        d="M8 2.5l6 10.5H2z"
      />
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="1.8"
        d="M8 6.2V9.8"
      />
      <circle fill="currentColor" cx="8" cy="12" r="0.9" />
    </svg>
  `,
  OVERDUE: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="2"
        d="M4.5 4.5l7 7m0-7l-7 7"
      />
    </svg>
  `,
  unknown: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false">
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      />
      <path
        d="M8 5.5c1.1 0 1.9.8 1.9 1.8 0 .9-.5 1.3-1.1 1.7-.5.3-.8.7-.8 1.5"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="1.8"
      />
      <circle fill="currentColor" cx="8" cy="12" r="0.8" />
    </svg>
  `,
};

const STATUS_LABELS = {
  COMPLETE: "Complete",
  DUE_SOON: "Due soon",
  OVERDUE: "Overdue",
  unknown: "Not available",
};

const normalizeStatus = (value) => {
  if (!value) {
    return "unknown";
  }

  const normalized = value.toString().trim().toUpperCase();

  if (normalized === "COMPLETE" || normalized === "COMPLETED") {
    return "COMPLETE";
  }

  if (normalized === "DUE_SOON") {
    return "DUE_SOON";
  }

  if (normalized === "OVERDUE") {
    return "OVERDUE";
  }

  return "unknown";
};

const setContent = (container, node) => {
  container.innerHTML = "";
  container.appendChild(node);
};

const showMessage = (container, message) => {
  const paragraph = document.createElement("p");
  paragraph.className = "vanta-security__empty";
  paragraph.textContent = message;
  setContent(container, paragraph);
};

const showLoading = (container) => {
  const paragraph = document.createElement("p");
  paragraph.className = "vanta-security__empty";
  paragraph.textContent = "Loading security tasks…";
  setContent(container, paragraph);
};

const renderTasks = (container, userFields) => {
  if (!userFields) {
    showMessage(container, FALLBACK_MESSAGE);
    return;
  }

  const list = document.createElement("ul");
  list.className = "vanta-security__list";

  TASKS.forEach((task) => {
    const rawValue = userFields[task.key];
    const statusKey = normalizeStatus(rawValue);

    const item = document.createElement("li");
    item.className = "vanta-security__item";
    item.dataset.status = statusKey;

    const icon = document.createElement("span");
    icon.className = "vanta-security__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = ICON_TEMPLATES[statusKey] || ICON_TEMPLATES.unknown;

    const details = document.createElement("div");
    details.className = "vanta-security__details";

    const taskName = document.createElement("span");
    taskName.className = "vanta-security__task";
    taskName.textContent = task.label;

    const statusText = document.createElement("span");
    statusText.className = "vanta-security__status";
    statusText.textContent = STATUS_LABELS[statusKey] || STATUS_LABELS.unknown;

    details.appendChild(taskName);
    details.appendChild(statusText);

    item.appendChild(icon);
    item.appendChild(details);

    list.appendChild(item);
  });

  setContent(container, list);
};

const initVantaSecuritySection = () => {
  const section = document.querySelector(".vanta-security");
  if (!section) {
    return;
  }

  const content = section.querySelector("[data-vanta-security-content]");
  if (!content) {
    section.hidden = true;
    return;
  }

  const profileUserIdAttr = section.getAttribute("data-profile-user-id");
  const profileUserId = profileUserIdAttr
    ? parseInt(profileUserIdAttr, 10)
    : NaN;

  if (!profileUserId) {
    section.hidden = true;
    return;
  }

  if (!window.fetch) {
    showMessage(content, FALLBACK_MESSAGE);
    return;
  }

  showLoading(content);

  fetch("/api/v2/users/me")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load profile.");
      }
      return response.json();
    })
    .then((data) => {
      if (!data || !data.user) {
        throw new Error("Invalid profile response.");
      }

      if (data.user.id !== profileUserId) {
        section.hidden = true;
        return;
      }

      renderTasks(content, data.user.user_fields || {});
    })
    .catch(() => {
      showMessage(content, FALLBACK_MESSAGE);
    });
};

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initVantaSecuritySection);
} else {
  initVantaSecuritySection();
}
