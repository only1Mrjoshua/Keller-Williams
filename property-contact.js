// property-contact.js - Formspree property contact handler
const PROPERTY_FORMSPREE_ENDPOINT = "https://formspree.io/f/xvzvpbaq";

class ToastNotification {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!document.querySelector(".toast-container")) {
      this.container = document.createElement("div");
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
      this.addToastStyles();
    } else {
      this.container = document.querySelector(".toast-container");
    }
  }

  addToastStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 360px;
      }

      .toast {
        position: relative;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 18px;
        border-radius: 16px;
        overflow: hidden;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)),
          rgba(217, 4, 41, 0.88);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #ffffff;
        box-shadow:
          0 12px 35px rgba(217, 4, 41, 0.35),
          inset 0 1px 0 rgba(255,255,255,0.12);
        transform: translateX(120%);
        opacity: 0;
        animation: slideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }

      .toast::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          120deg,
          rgba(255,255,255,0.25),
          rgba(255,255,255,0.05) 40%,
          rgba(255,255,255,0.00)
        );
        pointer-events: none;
      }

      .toast::after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 4px;
        height: 100%;
        border-radius: 999px;
        background: #ffffff;
        opacity: 0.9;
      }

      .toast.success {
        background:
          linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05)),
          rgba(220, 20, 60, 0.86);
      }

      .toast.error {
        background:
          linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03)),
          rgba(140, 0, 20, 0.92);
      }

      .toast.warning {
        background:
          linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03)),
          rgba(180, 30, 40, 0.92);
      }

      .toast-icon {
        position: relative;
        z-index: 1;
        width: 34px;
        height: 34px;
        min-width: 34px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 700;
        background: rgba(255,255,255,0.15);
        border: 1px solid rgba(255,255,255,0.2);
        color: #ffffff;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
      }

      .toast-message {
        position: relative;
        z-index: 1;
        flex: 1;
        font-size: 14px;
        line-height: 1.45;
        font-weight: 500;
        letter-spacing: 0.2px;
        color: rgba(255,255,255,0.96);
      }

      @keyframes slideIn {
        0% {
          transform: translateX(120%);
          opacity: 0;
        }
        100% {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes fadeOut {
        0% {
          transform: translateX(0);
          opacity: 1;
        }
        100% {
          transform: translateX(120%);
          opacity: 0;
        }
      }

      @media (max-width: 640px) {
        .toast-container {
          top: 16px;
          right: 12px;
          left: 12px;
          max-width: none;
        }

        .toast {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  show(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.innerHTML =
      type === "success" ? "✓" :
      type === "error" ? "✕" :
      "⚠";

    const messageElement = document.createElement("span");
    messageElement.className = "toast-message";
    messageElement.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(messageElement);
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "fadeOut 0.3s ease forwards";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }
}

const toast = new ToastNotification();

function setFieldState(field, hasError) {
  if (!field) return;
  field.style.borderColor = hasError ? "#d90429" : "";
}

function validatePropertyForm(form) {
  const fullNameField = form.querySelector('[name="fullName"]');
  const emailField = form.querySelector('[name="email"]');
  const messageField = form.querySelector('[name="message"]');

  const fullName = fullNameField?.value.trim() || "";
  const email = emailField?.value.trim() || "";
  const message = messageField?.value.trim() || "";

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  setFieldState(fullNameField, !fullName);
  setFieldState(emailField, !email || !emailIsValid);
  setFieldState(messageField, !message);

  if (!fullName || !email || !message) {
    return {
      valid: false,
      message: "Please fill in all required fields.",
    };
  }

  if (!emailIsValid) {
    return {
      valid: false,
      message: "Please enter a valid email address.",
    };
  }

  return { valid: true };
}

async function sendPropertyFormToFormspree(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  if (!submitButton) return;

  const originalButtonText = submitButton.textContent;
  submitButton.textContent = "Sending...";
  submitButton.disabled = true;

  try {
    const validation = validatePropertyForm(form);
    if (!validation.valid) {
      toast.show(validation.message, "warning");
      return;
    }

    const formData = new FormData(form);

    const propertyId =
      new URLSearchParams(window.location.search).get("id") || "";
    const propertyTitle =
      document.querySelector(".property-title h1")?.textContent?.trim() ||
      "Property Inquiry";

    formData.append("subject", `Property Inquiry - ${propertyTitle}`);
    formData.append("propertyId", propertyId);
    formData.append("propertyTitle", propertyTitle);
    formData.append("pageUrl", window.location.href);
    formData.append("formType", "Property Contact");

    const response = await fetch(PROPERTY_FORMSPREE_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        result?.errors?.[0]?.message || "Failed to send message."
      );
    }

    toast.show("Message sent successfully! We'll get back to you.", "success");
    form.reset();

    form.querySelectorAll("input, textarea").forEach((field) => {
      setFieldState(field, false);
    });
  } catch (error) {
    console.error("Property Formspree error:", error);
    toast.show(error.message || "Failed to send message.", "error");
  } finally {
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
  }
}

function bindPropertyContactForm(form) {
  if (!form || form.dataset.bound === "true") return;

  form.dataset.bound = "true";

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    event.stopPropagation();
    await sendPropertyFormToFormspree(form);
  });

  form.querySelectorAll("input[required], textarea[required]").forEach((field) => {
    field.addEventListener("blur", function () {
      setFieldState(this, !this.value.trim());
    });

    field.addEventListener("input", function () {
      if (this.value.trim()) {
        setFieldState(this, false);
      }
    });
  });
}

function tryInitPropertyContactForm() {
  const form = document.getElementById("propertyContactForm");
  if (!form) return false;

  bindPropertyContactForm(form);
  return true;
}

document.addEventListener("DOMContentLoaded", function () {
  if (tryInitPropertyContactForm()) return;

  const observer = new MutationObserver(() => {
    if (tryInitPropertyContactForm()) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});