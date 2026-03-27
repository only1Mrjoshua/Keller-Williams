// contact.js - Formspree + Toast Notification
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

        /* 🔴 RED GLASS BASE */
        background:
          linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)),
          rgba(217, 4, 41, 0.85);

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

      /* subtle shine */
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

      /* accent line */
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

      /* SUCCESS (slightly lighter red / premium feel) */
      .toast.success {
        background:
          linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05)),
          rgba(220, 20, 60, 0.85);
      }

      /* ERROR (deeper red) */
      .toast.error {
        background:
          linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03)),
          rgba(160, 0, 20, 0.9);
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
        color: rgba(255,255,255,0.95);
      }

      /* animations */
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

      /* mobile */
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
    icon.innerHTML = type === "success" ? "✓" : "✗";

    const messageElement = document.createElement("span");
    messageElement.className = "toast-message";
    messageElement.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(messageElement);
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "fadeOut 0.3s ease forwards";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}

const toast = new ToastNotification();

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");

  if (!contactForm) {
    console.error("Contact form not found!");
    return;
  }

  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    submitButton.textContent = "Sending...";
    submitButton.disabled = true;

    try {
      // simple validation
      const fullName = document.getElementById("fullName")?.value.trim();
      const email = document.getElementById("email")?.value.trim();
      const phone = document.getElementById("phone")?.value.trim();
      const subject = document.getElementById("subject")?.value || "General Inquiry";
      const message = document.getElementById("message")?.value.trim();

      if (!fullName || !email || !message) {
        throw new Error("Please fill in all required fields.");
      }

      // Formspree endpoint
      const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvzvpbaq";

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phone", phone || "");
      formData.append("subject", subject);
      formData.append("message", message);

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        toast.show("Message sent successfully!", "success");
        contactForm.reset();
      } else {
        let errorMessage = "Failed to send message";

        if (data && data.errors && data.errors.length > 0) {
          errorMessage = data.errors[0].message || errorMessage;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.show(error.message || "Failed to send message", "error");
    } finally {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });
});