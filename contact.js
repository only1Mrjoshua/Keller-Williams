// contact.js - Updated for FastAPI backend
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
        gap: 10px;
        max-width: 350px;
      }
      
      .toast {
        padding: 16px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(120%);
        transition: transform 0.3s ease;
        animation: slideIn 0.3s ease forwards;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .toast.success {
        background-color: #10b981;
        border-left: 4px solid #059669;
      }
      
      .toast.error {
        background-color: #ef4444;
        border-left: 4px solid #dc2626;
      }
      
      .toast-icon {
        font-size: 18px;
      }
      
      .toast-message {
        flex: 1;
      }
      
      @keyframes slideIn {
        to {
          transform: translateX(0);
        }
      }
      
      @keyframes fadeOut {
        to {
          opacity: 0;
          transform: translateX(120%);
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

  // Remove any existing event listeners to prevent conflicts
  const newForm = contactForm.cloneNode(true);
  contactForm.parentNode.replaceChild(newForm, contactForm);

  const freshForm = document.getElementById("contactForm");

  freshForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Disable submit button
    const submitButton = freshForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Sending...";
    submitButton.disabled = true;

    // Collect form data
    const formData = {
      name: document.getElementById("fullName").value.trim(), // Note: Change from fullName to name
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim() || null,
      subject: document.getElementById("subject").value || "General Inquiry",
      message: document.getElementById("message").value.trim(),
    };

  try {
  // Determine base URL (Localhost → local, Production → Render)
  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://kwelitehomes.com";

  // Make the fetch request
  const response = await fetch(`${BASE_URL}/contact/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (response.ok) {
    const data = await response.json();
    console.log("Success:", data);
    toast.show("Message sent successfully!", "success");
    freshForm.reset();
  } else {
    // Try to get error details
    let errorMessage = "Failed to send message";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = `Server responded with status: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

} catch (error) {
  console.error("Error sending message:", error);
  toast.show(`Failed to send message: ${error.message}`, "error");

} finally {
  submitButton.textContent = originalButtonText;
  submitButton.disabled = false;
}

  });
});
