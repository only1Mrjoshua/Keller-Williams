// ===== CONFIG =====
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvzvpbaq";

// ===== READ MORE BUTTONS =====
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".read-more-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const description = this.closest(".property-description");
      if (!description) return;

      const isExpanded = description.classList.contains("expanded");
      description.classList.toggle("expanded", !isExpanded);
      this.textContent = isExpanded ? "Read More" : "Read Less";
    });
  });
});

// ===== MAIN APPLICATION =====
document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  setActivePage();
  initSearch();
  initContactForms();
  initOutsideClickHandler();
  initScrollReveal();

  const currentPath = window.location.pathname;
  const currentPage = currentPath.split("/").pop() || "index.html";

  if (currentPath.includes("property-details.html")) {
    loadPropertyDetails();
  }

  if (
    currentPage === "index.html" ||
    currentPath === "/" ||
    currentPath.endsWith("/")
  ) {
    loadFeaturedProperties();
  }

  if (currentPath.includes("listings.html")) {
    loadAllListings();
  }
});

// ===== MOBILE NAVIGATION =====
function initMobileNavigation() {
  if (window.mobileNavInitialized) return;
  window.mobileNavInitialized = true;

  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (!hamburger || !navLinks) return;

  let overlay = document.querySelector(".nav-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "nav-overlay";
    document.body.appendChild(overlay);
  }

  function openMenu() {
    hamburger.classList.add("active");
    navLinks.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    hamburger.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    hamburger.classList.remove("active");
    navLinks.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    hamburger.setAttribute("aria-expanded", "false");
  }

  function toggleMenu(e) {
    e.stopPropagation();
    if (navLinks.classList.contains("active")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  hamburger.setAttribute("aria-expanded", "false");
  hamburger.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", closeMenu);

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 767) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  window.closeMobileMenu = closeMenu;
}

// ===== OUTSIDE CLICK HANDLER =====
function initOutsideClickHandler() {
  const navLinks = document.querySelector(".nav-links");
  const hamburger = document.querySelector(".hamburger");

  if (!navLinks || !hamburger) return;

  document.addEventListener("click", function (e) {
    const clickedInsideMenu = navLinks.contains(e.target);
    const clickedHamburger = hamburger.contains(e.target);

    if (
      navLinks.classList.contains("active") &&
      !clickedInsideMenu &&
      !clickedHamburger
    ) {
      if (typeof window.closeMobileMenu === "function") {
        window.closeMobileMenu();
      }
    }
  });
}

// ===== SET ACTIVE PAGE =====
function setActivePage() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href");

    if (
      linkPage === currentPage ||
      (currentPage === "" && linkPage === "index.html") ||
      (window.location.pathname === "/" && linkPage === "index.html")
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// ===== SEARCH FUNCTIONALITY =====
function initSearch() {
  const homeSearchForm = document.getElementById("searchForm");
  if (homeSearchForm) {
    homeSearchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleHomeSearch();
    });
  }

  const listingsSearch = document.getElementById("listingsSearch");
  if (listingsSearch) {
    listingsSearch.addEventListener(
      "input",
      debounce(performListingsSearch, 300)
    );

    listingsSearch.addEventListener("keyup", function (e) {
      if (e.key === "Escape") {
        this.value = "";
        performListingsSearch();
      }
    });
  }

  ["categoryFilter", "priceFilter", "propertyTypeFilter", "bedroomsFilter"].forEach(
    (filterId) => {
      const filter = document.getElementById(filterId);
      if (filter) {
        filter.addEventListener("change", performListingsSearch);
      }
    }
  );

  const clearAllBtn = document.getElementById("clearAllFilters");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", clearAllFilters);
  }
}

// ===== HOME PAGE SEARCH =====
function handleHomeSearch() {
  const location = document.getElementById("location")?.value || "";
  const price = document.getElementById("price")?.value || "";
  const category = document.getElementById("categoryFilter")?.value || "";

  const queryParams = new URLSearchParams();

  if (location) queryParams.set("location", location);
  if (price) queryParams.set("price", price);
  if (category) queryParams.set("category", category);

  const queryString = queryParams.toString();
  window.location.href = `listings.html${queryString ? "?" + queryString : ""}`;
}

// ===== LISTINGS SEARCH =====
function performListingsSearch() {
  const searchTerm =
    document.getElementById("listingsSearch")?.value.trim().toLowerCase() || "";
  const categoryFilter = document.getElementById("categoryFilter")?.value || "";
  const priceFilter = document.getElementById("priceFilter")?.value || "";
  const typeFilter = document.getElementById("propertyTypeFilter")?.value || "";
  const bedroomsFilter = document.getElementById("bedroomsFilter")?.value || "";

  const propertyCards = document.querySelectorAll(".property-card");
  const categorySections = document.querySelectorAll(".category-section");

  const categoriesWithVisibleProps = new Set();
  let visibleCount = 0;

  propertyCards.forEach((card) => {
    const title = (card.getAttribute("data-title") || "").toLowerCase();
    const location = (card.getAttribute("data-location") || "").toLowerCase();
    const category = card.getAttribute("data-category") || "";
    const priceNumber = parseFloat(card.getAttribute("data-price") || 0);
    const propertyType = (card.getAttribute("data-type") || "").toLowerCase();
    const bedrooms = parseInt(card.getAttribute("data-bedrooms") || 0, 10);

    const textMatch =
      !searchTerm || title.includes(searchTerm) || location.includes(searchTerm);

    const categoryMatch = !categoryFilter || category === categoryFilter;

    let priceMatch = true;
    if (priceFilter) {
      switch (priceFilter) {
        case "under-500k":
          priceMatch = priceNumber <= 500000;
          break;
        case "500k-1m":
          priceMatch = priceNumber >= 500000 && priceNumber <= 1000000;
          break;
        case "1m-2m":
          priceMatch = priceNumber >= 1000000 && priceNumber <= 2000000;
          break;
        case "over-2m":
          priceMatch = priceNumber > 2000000;
          break;
      }
    }

    const typeMatch = !typeFilter || propertyType === typeFilter.toLowerCase();
    const bedroomsMatch =
      !bedroomsFilter || bedrooms >= parseInt(bedroomsFilter, 10);

    if (textMatch && categoryMatch && priceMatch && typeMatch && bedroomsMatch) {
      card.style.display = "block";
      card.style.animation = "fadeIn 0.3s ease";
      visibleCount++;
      categoriesWithVisibleProps.add(category);
    } else {
      card.style.display = "none";
    }
  });

  categorySections.forEach((section) => {
    const sectionCategory = section.getAttribute("data-category");
    section.style.display = categoriesWithVisibleProps.has(sectionCategory)
      ? "block"
      : "none";
  });

  updateSearchResults(visibleCount);
}

// ===== UPDATE SEARCH RESULTS =====
function updateSearchResults(count) {
  const listingCountElement = document.getElementById("listingCount");
  if (listingCountElement) listingCountElement.textContent = count;

  const noResultsMessage = document.getElementById("noResultsMessage");
  if (!noResultsMessage) return;

  const searchValue =
    document.getElementById("listingsSearch")?.value.trim() || "";
  const categoryValue = document.getElementById("categoryFilter")?.value || "";
  const priceValue = document.getElementById("priceFilter")?.value || "";
  const typeValue = document.getElementById("propertyTypeFilter")?.value || "";
  const bedroomsValue = document.getElementById("bedroomsFilter")?.value || "";

  const hasActiveFilters = Boolean(
    searchValue || categoryValue || priceValue || typeValue || bedroomsValue
  );

  noResultsMessage.style.display =
    count === 0 && hasActiveFilters ? "block" : "none";
}

// ===== CLEAR ALL FILTERS =====
function clearAllFilters() {
  const listingsSearch = document.getElementById("listingsSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const priceFilter = document.getElementById("priceFilter");
  const propertyTypeFilter = document.getElementById("propertyTypeFilter");
  const bedroomsFilter = document.getElementById("bedroomsFilter");

  if (listingsSearch) listingsSearch.value = "";
  if (categoryFilter) categoryFilter.value = "";
  if (priceFilter) priceFilter.value = "";
  if (propertyTypeFilter) propertyTypeFilter.value = "";
  if (bedroomsFilter) bedroomsFilter.value = "";

  document.querySelectorAll(".category-section").forEach((section) => {
    section.style.display = "block";
  });

  const propertyCards = document.querySelectorAll(".property-card");
  propertyCards.forEach((card) => {
    card.style.display = "block";
  });

  updateSearchResults(propertyCards.length);

  if (listingsSearch) listingsSearch.focus();
}

// ===== FEATURED PROPERTIES =====
function loadFeaturedProperties() {
  const featuredContainer = document.getElementById("featuredProperties");
  if (!featuredContainer || typeof properties === "undefined") return;

  const sortedProperties = [...properties].sort((a, b) => {
    const priceA = extractPriceNumber(a.price);
    const priceB = extractPriceNumber(b.price);
    return priceB - priceA;
  });

  const featured = sortedProperties.slice(0, 3);
  let html = "";

  featured.forEach((property) => {
    const badge =
      property.status === "under-contract"
        ? '<div class="property-badge under-contract">Under Contract</div>'
        : "";

    html += `
      <div class="property-card" data-id="${property.id}">
        <div class="property-img" style="background-image: url('${property.image}');">
          ${badge}
        </div>
        <div class="property-info">
          <div class="property-price">${property.price}</div>
          <h3>${property.title}</h3>
          <div class="property-location">
            <span>📍</span> ${property.location}
          </div>
          <p>${property.shortDescription}</p>
          <button class="btn view-details" data-id="${property.id}">View Details</button>
        </div>
      </div>
    `;
  });

  featuredContainer.innerHTML = html;
  attachPropertyCardListeners();
}

// ===== ALL LISTINGS =====
function loadAllListings() {
  const listingsContainer = document.getElementById("listingsContainer");
  if (!listingsContainer || typeof properties === "undefined") return;

  const categories = {};

  properties.forEach((property) => {
    const category = property.category || "Other";
    if (!categories[category]) categories[category] = [];
    categories[category].push(property);
  });

  let html = "";

  for (const [categoryName, categoryProperties] of Object.entries(categories)) {
    if (!categoryProperties.length) continue;

    const categoryDisplayName = formatCategoryName(categoryName);

    html += `
      <div class="category-section" data-category="${categoryName}">
        <h2 class="category-title">${categoryDisplayName}</h2>
        <div class="category-divider"></div>
      </div>
    `;

    categoryProperties.forEach((property) => {
      const priceNumber = extractPriceNumber(property.price);
      const badge =
        property.status === "under-contract"
          ? '<div class="property-badge under-contract">Under Contract</div>'
          : "";

      html += `
        <div class="property-card"
          data-id="${property.id}"
          data-category="${property.category || "Other"}"
          data-type="${property.propertyType ? property.propertyType.toLowerCase() : ""}"
          data-bedrooms="${property.bedrooms || 0}"
          data-price="${priceNumber}"
          data-location="${(property.location || "").toLowerCase()}"
          data-title="${(property.title || "").toLowerCase()}">
          <div class="property-img" style="background-image: url('${property.image}');">
            ${badge}
          </div>
          <div class="property-info">
            <div class="property-price">${property.price}</div>
            <h3>${property.title}</h3>
            <div class="property-location">
              <span>📍</span> ${property.location}
            </div>
            <p>${property.shortDescription}</p>
            <button class="btn view-details" data-id="${property.id}">View Details</button>
          </div>
        </div>
      `;
    });
  }

  listingsContainer.innerHTML = html;

  const listingCount = document.getElementById("listingCount");
  if (listingCount) listingCount.textContent = properties.length;

  attachPropertyCardListeners();
  applyURLFilters();
  createNoResultsMessage();
  performListingsSearch();
}

// ===== FORMAT CATEGORY NAME =====
function formatCategoryName(category) {
  const specialCases = {
    "Double Wide": "DOUBLE WIDE HOMES",
    "Single Wide": "SINGLE WIDE HOMES",
    "Manufactured Home": "MANUFACTURED HOMES",
    "Single Family": "SINGLE FAMILY HOMES",
    Farmhouse: "FARMHOUSES",
    "Multi Family": "MULTI-FAMILY HOMES",
    Condominium: "CONDOMINIUMS",
  };

  if (specialCases[category]) return specialCases[category];

  let formatted = category.replace(/([A-Z])/g, " $1").trim().toUpperCase();

  if (!formatted.includes("HOMES") && !formatted.includes("CONDO")) {
    formatted += " HOMES";
  }

  return formatted;
}

// ===== ATTACH PROPERTY CARD LISTENERS =====
function attachPropertyCardListeners() {
  document.querySelectorAll(".view-details").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const propertyId = this.getAttribute("data-id");
      if (propertyId) {
        window.location.href = `property-details.html?id=${propertyId}`;
      }
    });
  });

  document.querySelectorAll(".property-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      if (!e.target.classList.contains("btn") && !e.target.closest(".btn")) {
        const propertyId = this.getAttribute("data-id");
        if (propertyId) {
          window.location.href = `property-details.html?id=${propertyId}`;
        }
      }
    });
  });
}

// ===== CREATE NO RESULTS MESSAGE =====
function createNoResultsMessage() {
  const listingsGrid = document.querySelector(".listings-grid");
  if (!listingsGrid || document.getElementById("noResultsMessage")) return;

  const messageDiv = document.createElement("div");
  messageDiv.id = "noResultsMessage";
  messageDiv.className = "no-results-message";
  messageDiv.style.display = "none";
  messageDiv.innerHTML = `
    <h3>No Properties Match Your Criteria</h3>
    <p>Try adjusting your search filters or browse all properties.</p>
    <button id="clearSearchBtn" class="btn">Clear All Filters</button>
  `;

  listingsGrid.parentNode.insertBefore(messageDiv, listingsGrid.nextSibling);

  const clearBtn = document.getElementById("clearSearchBtn");
  if (clearBtn) clearBtn.addEventListener("click", clearAllFilters);
}

// ===== APPLY URL FILTERS =====
function applyURLFilters() {
  const urlParams = new URLSearchParams(window.location.search);

  const location = urlParams.get("location");
  const price = urlParams.get("price");
  const category = urlParams.get("category");

  if (location) {
    const searchInput = document.getElementById("listingsSearch");
    if (searchInput) searchInput.value = location;
  }

  if (price) {
    const priceFilter = document.getElementById("priceFilter");
    if (priceFilter) priceFilter.value = price;
  }

  if (category) {
    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) categoryFilter.value = category;
  }
}

// ===== PROPERTY DETAILS =====
function loadPropertyDetails() {
  if (typeof properties === "undefined") return;

  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = parseInt(urlParams.get("id"), 10);

  if (!propertyId || Number.isNaN(propertyId)) {
    showPropertyNotFound();
    return;
  }

  const property = properties.find((p) => p.id === propertyId);

  if (!property) {
    showPropertyNotFound();
    return;
  }

  updatePropertyPage(property);
}

// ===== SHOW PROPERTY NOT FOUND =====
function showPropertyNotFound() {
  const propertyDetails = document.querySelector(".property-details");
  if (!propertyDetails) return;

  propertyDetails.innerHTML = `
    <div class="container" style="text-align: center; padding: 80px 20px;">
      <h2>Property Not Found</h2>
      <p style="margin-bottom: 30px;">Sorry, the property you're looking for doesn't exist.</p>
      <a href="listings.html" class="btn">Back to Listings</a>
    </div>
  `;
}

// ===== UPDATE PROPERTY PAGE =====
function updatePropertyPage(property) {
  document.title = `${property.title} - Real Estate`;

  const gallery = document.querySelector(".property-gallery");
  if (gallery) {
    let galleryHtml = "";
    const badge =
      property.status === "under-contract"
        ? '<div class="property-badge under-contract">Under Contract</div>'
        : "";

    property.gallery.forEach((img, index) => {
      const className = index === 0 ? "gallery-main" : "gallery-item";

      if (index === 0 && property.status === "under-contract") {
        galleryHtml += `<div class="${className}" style="background-image: url('${img}'); position: relative;">${badge}</div>`;
      } else {
        galleryHtml += `<div class="${className}" style="background-image: url('${img}');"></div>`;
      }
    });

    gallery.innerHTML = galleryHtml;
  }

  const propertyTitle = document.querySelector(".property-title");
  if (propertyTitle) {
    propertyTitle.innerHTML = `
      <h1>${property.title}</h1>
      <div class="property-price">${property.price}</div>
    `;
  }

  const propertyLocation = document.querySelector(".property-location");
  if (propertyLocation) {
    propertyLocation.innerHTML = `<span>📍</span> ${property.location}`;
  }

  const propertyContent = document.querySelector(".property-content");
  if (propertyContent) {
    propertyContent.innerHTML = `
      <div class="property-description">
        <h3>Property Description</h3>
        <p>${property.fullDescription}</p>

        <h3>Property Features</h3>
        <div class="property-features">
          ${property.features
            .map(
              (feature) => `
                <div class="feature-item">
                  <div class="feature-icon">✓</div>
                  <span>${feature}</span>
                </div>
              `
            )
            .join("")}
        </div>

        <h3>Property Details</h3>
        <div class="property-details-list">
          <p><strong>Property Type:</strong> ${property.propertyType}</p>
          <p><strong>Bedrooms:</strong> ${property.bedrooms}</p>
          <p><strong>Bathrooms:</strong> ${property.bathrooms}</p>
          <p><strong>Square Feet:</strong> ${property.sqft}</p>
          <p><strong>Year Built:</strong> ${property.yearBuilt}</p>
        </div>
      </div>

      <div class="property-sidebar">
        <div class="agent-card">
          <h3>Contact Agent</h3>
          <div class="agent-info">
            <div class="agent-avatar">
              <span>${property.agent.name.charAt(0)}</span>
            </div>
            <div>
              <h4>${property.agent.name}</h4>
              <p>Licensed Real Estate Agent</p>
            </div>
          </div>
          <div class="agent-contact">
            <p><strong>Phone:</strong> ${property.agent.phone}</p>
          </div>

          <form class="contact-form" id="propertyContactForm" novalidate>
            <input type="text" name="fullName" placeholder="Your Name" required />
            <input type="email" name="email" placeholder="Your Email" required />
            <input type="tel" name="phone" placeholder="Your Phone" />
            <textarea name="message" placeholder="Your Message" required></textarea>
            <button type="submit" class="btn">Send Message</button>
          </form>
        </div>
      </div>
    `;
  }

  initPropertyContactForm();
}

// ===== INITIALIZE CONTACT FORMS =====
function initContactForms() {
  const contactForm = document.getElementById("contactForm");
  if (contactForm && !contactForm.hasAttribute("data-initialized")) {
    contactForm.setAttribute("data-initialized", "true");
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      await handleMainContactForm(contactForm);
    });
  }

  initPropertyContactForm();
}

// ===== INITIALIZE PROPERTY CONTACT FORM =====
function initPropertyContactForm() {
  const existingForm = document.getElementById("propertyContactForm");
  if (!existingForm) return;

  const cleanForm = existingForm.cloneNode(true);
  existingForm.parentNode.replaceChild(cleanForm, existingForm);

  cleanForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    e.stopPropagation();
    await handlePropertyContactForm(cleanForm);
  });
}

// ===== FORM HELPERS =====
function setFieldError(field, message) {
  if (!field) return;

  field.style.borderColor = "var(--primary-red)";
  let errorDiv = field.parentElement?.querySelector(".error-message");

  if (!errorDiv && field.parentElement) {
    errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.marginTop = "6px";
    errorDiv.style.fontSize = "13px";
    errorDiv.style.color = "var(--primary-red)";
    field.parentElement.appendChild(errorDiv);
  }

  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  }
}

function clearFieldError(field) {
  if (!field) return;

  field.style.borderColor = "";
  const errorDiv = field.parentElement?.querySelector(".error-message");
  if (errorDiv) {
    errorDiv.textContent = "";
    errorDiv.style.display = "none";
  }
}

function validateRequiredFields(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll("[required]");

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      isValid = false;
      setFieldError(field, "This field is required");
    } else {
      clearFieldError(field);
    }
  });

  return isValid;
}

async function submitToFormspree(payload) {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.errors?.[0]?.message || "Failed to send message.");
  }

  return result;
}

// ===== MAIN CONTACT FORM =====
async function handleMainContactForm(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) return;

  const originalBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  try {
    const isValid = validateRequiredFields(form);
    if (!isValid) {
      throw new Error("Please fill in all required fields.");
    }

    const payload = {
      fullName: form.querySelector("#fullName")?.value.trim() || "",
      email: form.querySelector("#email")?.value.trim() || "",
      phone: form.querySelector("#phone")?.value.trim() || "",
      subject: form.querySelector("#subject")?.value || "General Inquiry",
      message: form.querySelector("#message")?.value.trim() || "",
      formType: "General Contact",
      pageUrl: window.location.href,
    };

    await submitToFormspree(payload);
    showFormSuccessMessage(form, "Message sent successfully!");
    form.reset();
  } catch (error) {
    console.error("Main contact form error:", error);
    showFormError(form, error.message || "Failed to send message.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
}

// ===== PROPERTY CONTACT FORM =====
async function handlePropertyContactForm(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) return;

  const originalBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  try {
    const isValid = validateRequiredFields(form);
    if (!isValid) {
      throw new Error("Please fill in all required fields.");
    }

    const payload = {
      fullName: form.querySelector('[name="fullName"]')?.value.trim() || "",
      email: form.querySelector('[name="email"]')?.value.trim() || "",
      phone: form.querySelector('[name="phone"]')?.value.trim() || "",
      message: form.querySelector('[name="message"]')?.value.trim() || "",
      subject: "Property Inquiry",
      formType: "Property Contact",
      propertyId: new URLSearchParams(window.location.search).get("id") || "",
      pageUrl: window.location.href,
    };

    await submitToFormspree(payload);

    form.reset();
  } catch (error) {
    console.error("Property contact form error:", error);
    showFormError(form, error.message || "Failed to send message.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
}

// ===== SHOW SUCCESS MESSAGE =====
function showFormSuccessMessage(form, message = "Message sent successfully!") {
  let successDiv = form.parentElement.querySelector(".success-message");

  if (!successDiv) {
    successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.style.cssText = `
      background-color: #ecfdf3;
      color: #166534;
      padding: 16px;
      margin-top: 20px;
      border-radius: 16px;
      border: 1px solid #bbf7d0;
      text-align: center;
    `;
    form.parentElement.appendChild(successDiv);
  }

  successDiv.innerHTML = `
    <h4>✓ ${message}</h4>
    <p>Thank you for your message. Our team will get back to you shortly.</p>
  `;
  successDiv.style.display = "block";

  setTimeout(() => {
    successDiv.style.display = "none";
  }, 10000);
}

// ===== SHOW ERROR MESSAGE =====
function showFormError(form, errorMessage) {
  let errorDiv = form.parentElement.querySelector(".form-error-message");

  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "form-error-message";
    errorDiv.style.cssText = `
      background-color: #fef2f2;
      color: #991b1b;
      padding: 16px;
      margin-top: 20px;
      border-radius: 16px;
      border: 1px solid #fecaca;
      text-align: center;
    `;
    form.parentElement.appendChild(errorDiv);
  }

  errorDiv.innerHTML = `
    <h4>⚠ Error Submitting Form</h4>
    <p>${errorMessage}</p>
    <p>Please try again or call us directly.</p>
  `;
  errorDiv.style.display = "block";

  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 10000);
}

// ===== HELPER FUNCTIONS =====
function extractPriceNumber(priceString) {
  if (!priceString) return 0;
  const cleaned = String(priceString).replace(/[$,]/g, "");
  const matches = cleaned.match(/(\d+(?:\.\d+)?)/);
  return matches ? parseFloat(matches[1]) : 0;
}

function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
  const animatedElements = document.querySelectorAll(".fade-in-up");
  if (!animatedElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  animatedElements.forEach((element) => {
    observer.observe(element);
  });
}