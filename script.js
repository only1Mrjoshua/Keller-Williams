// Add this script to your page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all read more buttons
    document.querySelectorAll('.read-more-btn').forEach(button => {
        button.addEventListener('click', function() {
            const description = this.closest('.property-description');
            const isExpanded = description.classList.contains('expanded');
            
            if (isExpanded) {
                description.classList.remove('expanded');
                this.textContent = 'Read More';
            } else {
                description.classList.add('expanded');
                this.textContent = 'Read Less';
            }
        });
    });
});


// ===== MAIN APPLICATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile navigation
    initMobileNavigation();
    
    // Initialize search functionality
    initSearch();
    
    // Initialize property functionality based on page
    if (window.location.pathname.includes('property-details.html')) {
        loadPropertyDetails();
    }
    
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        loadFeaturedProperties();
    }
    
    if (window.location.pathname.includes('listings.html')) {
        loadAllListings();
    }
    
    // Initialize contact forms
    initContactForms();
    
    // Close mobile menu when clicking outside
    initOutsideClickHandler();
});

// ===== MOBILE NAVIGATION =====
function initMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (!hamburger || !navLinks) return;
    
    // Toggle mobile menu
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking links
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ===== CLOSE MENU WHEN CLICKING OUTSIDE =====
function initOutsideClickHandler() {
    document.addEventListener('click', function(e) {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        
        if (!navLinks || !hamburger) return;
        
        const isClickInsideMenu = navLinks.contains(e.target) || hamburger.contains(e.target);
        
        if (!isClickInsideMenu && navLinks.classList.contains('active')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ===== SEARCH FUNCTIONALITY =====
function initSearch() {
    // Homepage search form
    const homeSearchForm = document.getElementById('searchForm');
    if (homeSearchForm) {
        homeSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleHomeSearch();
        });
    }
    
    // Listings page search
    const listingsSearch = document.getElementById('listingsSearch');
    if (listingsSearch) {
        listingsSearch.addEventListener('input', debounce(performListingsSearch, 300));
        listingsSearch.addEventListener('keyup', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                performListingsSearch();
            }
        });
    }
    
    // Filter change listeners
    ['priceFilter', 'propertyTypeFilter', 'bedroomsFilter'].forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', performListingsSearch);
        }
    });
    
    // Clear all filters
    const clearAllBtn = document.getElementById('clearAllFilters');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllFilters);
    }
}

// ===== HOME PAGE SEARCH =====
function handleHomeSearch() {
    const location = document.getElementById('location')?.value || '';
    const price = document.getElementById('price')?.value || '';
    const type = document.getElementById('type')?.value || '';
    
    const queryParams = new URLSearchParams();
    if (location) queryParams.set('location', location);
    if (price) queryParams.set('price', price);
    if (type) queryParams.set('type', type);
    
    const queryString = queryParams.toString();
    window.location.href = `listings.html${queryString ? '?' + queryString : ''}`;
}

// ===== LISTINGS SEARCH =====
function performListingsSearch() {
    const searchTerm = document.getElementById('listingsSearch')?.value.trim().toLowerCase() || '';
    const priceFilter = document.getElementById('priceFilter')?.value || '';
    const typeFilter = document.getElementById('propertyTypeFilter')?.value || '';
    const bedroomsFilter = document.getElementById('bedroomsFilter')?.value || '';
    
    const propertyCards = document.querySelectorAll('.property-card');
    let visibleCount = 0;
    
    propertyCards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const location = card.getAttribute('data-location') || '';
        const priceNumber = parseFloat(card.getAttribute('data-price') || 0);
        const propertyType = card.getAttribute('data-type') || '';
        const bedrooms = parseInt(card.getAttribute('data-bedrooms') || 0);
        
        // Text search
        const textMatch = !searchTerm || 
                         title.includes(searchTerm) || 
                         location.includes(searchTerm);
        
        // Price filter
        let priceMatch = true;
        if (priceFilter) {
            switch (priceFilter) {
                case 'under-500k': priceMatch = priceNumber <= 500000; break;
                case '500k-1m': priceMatch = priceNumber >= 500000 && priceNumber <= 1000000; break;
                case '1m-2m': priceMatch = priceNumber >= 1000000 && priceNumber <= 2000000; break;
                case 'over-2m': priceMatch = priceNumber > 2000000; break;
            }
        }
        
        // Type filter
        const typeMatch = !typeFilter || propertyType === typeFilter.toLowerCase();
        
        // Bedrooms filter
        const bedroomsMatch = !bedroomsFilter || bedrooms >= parseInt(bedroomsFilter);
        
        // Show/hide based on all filters
        if (textMatch && priceMatch && typeMatch && bedroomsMatch) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    updateSearchResults(visibleCount);
}

// ===== UPDATE SEARCH RESULTS =====
function updateSearchResults(count) {
    const listingCountElement = document.getElementById('listingCount');
    if (listingCountElement) {
        listingCountElement.textContent = count;
    }
    
    // Show/hide no results message
    const noResultsMessage = document.getElementById('noResultsMessage');
    if (noResultsMessage) {
        const hasActiveFilters = document.querySelector('#listingsSearch:not([value=""])') ||
                               document.querySelector('#priceFilter:not([value=""])') ||
                               document.querySelector('#propertyTypeFilter:not([value=""])') ||
                               document.querySelector('#bedroomsFilter:not([value=""])');
        
        if (count === 0 && hasActiveFilters) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }
    }
}

// ===== CLEAR ALL FILTERS =====
function clearAllFilters() {
    document.getElementById('listingsSearch').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('propertyTypeFilter').value = '';
    document.getElementById('bedroomsFilter').value = '';
    performListingsSearch();
    document.getElementById('listingsSearch').focus();
}

// ===== FEATURED PROPERTIES =====
function loadFeaturedProperties() {
    const featuredContainer = document.getElementById('featuredProperties');
    if (!featuredContainer) return;
    
    const featured = properties.slice(0, 3);
    let html = '';
    
    featured.forEach(property => {
        // Check if this is property ID 15 for under contract badge
        const badge = property.id === 15 ? '<div class="property-badge under-contract">Under Contract</div>' : '';
        
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
    const listingsContainer = document.getElementById('listingsContainer');
    if (!listingsContainer) return;
    
    let html = '';
    properties.forEach(property => {
        const priceNumber = extractPriceNumber(property.price);

        // Check if this is property ID 15 for under contract badge
        const badge = property.id === 15 ? '<div class="property-badge under-contract">Under Contract</div>' : '';
        
        html += `
            <div class="property-card" 
                 data-id="${property.id}" 
                 data-type="${property.propertyType.toLowerCase()}" 
                 data-bedrooms="${property.bedrooms}"
                 data-price="${priceNumber}"
                 data-location="${property.location.toLowerCase()}"
                 data-title="${property.title.toLowerCase()}">
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
    
    listingsContainer.innerHTML = html;
    
    // Update listing count
    const listingCount = document.getElementById('listingCount');
    if (listingCount) {
        listingCount.textContent = properties.length;
    }
    
    attachPropertyCardListeners();
    applyURLFilters();
    createNoResultsMessage();
    performListingsSearch(); // Initial search to apply URL filters
}

// ===== ATTACH PROPERTY CARD LISTENERS =====
function attachPropertyCardListeners() {
    // View details buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const propertyId = this.getAttribute('data-id');
            window.location.href = `property-details.html?id=${propertyId}`;
        });
    });
    
    // Property card clicks
    document.querySelectorAll('.property-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn') && !e.target.closest('.btn')) {
                const propertyId = this.getAttribute('data-id');
                window.location.href = `property-details.html?id=${propertyId}`;
            }
        });
    });
}

// ===== CREATE NO RESULTS MESSAGE =====
function createNoResultsMessage() {
    const listingsGrid = document.querySelector('.listings-grid');
    if (!listingsGrid || document.getElementById('noResultsMessage')) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'noResultsMessage';
    messageDiv.className = 'no-results-message';
    messageDiv.style.display = 'none';
    messageDiv.innerHTML = `
        <h3>No Properties Match Your Criteria</h3>
        <p>Try adjusting your search filters or browse all properties.</p>
        <button id="clearSearchBtn" class="btn">Clear All Filters</button>
    `;
    
    listingsGrid.parentNode.insertBefore(messageDiv, listingsGrid.nextSibling);
    
    document.getElementById('clearSearchBtn').addEventListener('click', clearAllFilters);
}

// ===== APPLY URL FILTERS =====
function applyURLFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    ['location', 'price', 'type'].forEach(param => {
        const value = urlParams.get(param);
        if (value) {
            const element = document.getElementById(param === 'type' ? 'propertyTypeFilter' : param === 'price' ? 'priceFilter' : 'listingsSearch');
            if (element) {
                element.value = value;
            }
        }
    });
}

// ===== PROPERTY DETAILS =====
function loadPropertyDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = parseInt(urlParams.get('id'));
    
    if (!propertyId || isNaN(propertyId)) {
        showPropertyNotFound();
        return;
    }
    
    const property = properties.find(p => p.id === propertyId);
    
    if (!property) {
        showPropertyNotFound();
        return;
    }
    
    updatePropertyPage(property);
}

// ===== SHOW PROPERTY NOT FOUND =====
function showPropertyNotFound() {
    const propertyDetails = document.querySelector('.property-details');
    if (propertyDetails) {
        propertyDetails.innerHTML = `
            <div class="container" style="text-align: center; padding: 80px 20px;">
                <h2>Property Not Found</h2>
                <p style="margin-bottom: 30px;">Sorry, the property you're looking for doesn't exist.</p>
                <a href="listings.html" class="btn">Back to Listings</a>
            </div>
        `;
    }
}

// ===== UPDATE PROPERTY PAGE =====
function updatePropertyPage(property) {
    document.title = `${property.title} - Real Estate`;
    
    // Update gallery
    const gallery = document.querySelector('.property-gallery');
    if (gallery) {
        let galleryHtml = '';
        // Add badge to first/main gallery image if property is ID 3
        const badge = property.id === 15 ? '<div class="property-badge under-contract">Under Contract</div>' : '';
        
        property.gallery.forEach((img, index) => {
            const className = index === 0 ? 'gallery-main' : 'gallery-item';
            // Only add badge to main image
            if (index === 0 && property.id === 15) {
                galleryHtml += `<div class="${className}" style="background-image: url('${img}'); position: relative;">${badge}</div>`;
            } else {
                galleryHtml += `<div class="${className}" style="background-image: url('${img}');"></div>`;
            }
        });
        gallery.innerHTML = galleryHtml;
    }
    
    // Update property header
    const propertyTitle = document.querySelector('.property-title');
    if (propertyTitle) {
        propertyTitle.innerHTML = `
            <h1>${property.title}</h1>
            <div class="property-price">${property.price}</div>
        `;
    }
    
    // Update property location
    const propertyLocation = document.querySelector('.property-location');
    if (propertyLocation) {
        propertyLocation.innerHTML = `<span>📍</span> ${property.location}`;
    }
    
    // Update features
    const featuresContainer = document.querySelector('.property-features');
    if (featuresContainer) {
        let featuresHtml = '';
        property.features.forEach(feature => {
            featuresHtml += `
                <div class="feature-item">
                    <div class="feature-icon">✓</div>
                    <span>${feature}</span>
                </div>
            `;
        });
        featuresContainer.innerHTML = featuresHtml;
    }
    
    // Update property content
    const propertyContent = document.querySelector('.property-content');
    if (propertyContent) {
        propertyContent.innerHTML = `
            <div class="property-description">
                <h3>Property Description</h3>
                <p>${property.fullDescription}</p>
                
                <h3>Property Features</h3>
                <div class="property-features">
                    <!-- Features will be inserted by updatePropertyPage -->
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
                    <form class="contact-form" id="propertyContactForm">
                        <input type="text" placeholder="Your Name" required>
                        <input type="email" placeholder="Your Email" required>
                        <input type="tel" placeholder="Your Phone">
                        <textarea placeholder="Your Message" required></textarea>
                        <button type="submit" class="btn">Send Message</button>
                    </form>
                </div>
            </div>
        `;
        
        // Re-initialize features and contact form
        const newFeaturesContainer = propertyContent.querySelector('.property-features');
        if (newFeaturesContainer) {
            let featuresHtml = '';
            property.features.forEach(feature => {
                featuresHtml += `
                    <div class="feature-item">
                        <div class="feature-icon">✓</div>
                        <span>${feature}</span>
                    </div>
                `;
            });
            newFeaturesContainer.innerHTML = featuresHtml;
        }
    }
    
    initPropertyContactForm();
}

// ===== INITIALIZE CONTACT FORMS =====
function initContactForms() {
    // General contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm && !contactForm.hasAttribute('data-initialized')) {
        contactForm.setAttribute('data-initialized', 'true');
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(this);
        });
    }
    
    // Property contact form
    initPropertyContactForm();
}

// ===== INITIALIZE PROPERTY CONTACT FORM =====
function initPropertyContactForm() {
    const propertyContactForm = document.getElementById('propertyContactForm');
    if (propertyContactForm && !propertyContactForm.hasAttribute('data-initialized')) {
        propertyContactForm.setAttribute('data-initialized', 'true');
        propertyContactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(this);
        });
    }
}

// ===== HANDLE FORM SUBMISSION =====
async function handleFormSubmission(form) {
    // Disable submit button to prevent multiple submissions
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        // Simple validation
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'var(--primary-red)';
                
                // Show error message
                const errorDiv = field.parentElement.querySelector('.error-message');
                if (errorDiv) {
                    errorDiv.textContent = 'This field is required';
                    errorDiv.style.display = 'block';
                }
            } else {
                field.style.borderColor = '';
                const errorDiv = field.parentElement.querySelector('.error-message');
                if (errorDiv) {
                    errorDiv.textContent = '';
                    errorDiv.style.display = 'none';
                }
            }
        });
        
        if (!isValid) {
            throw new Error('Please fill in all required fields.');
        }
        
        // Prepare form data based on which form it is
        let formData;
        
        if (form.id === 'contactForm') {
            // Contact page form
            formData = {
                fullName: form.querySelector('#fullName').value.trim(),
                email: form.querySelector('#email').value.trim(),
                phone: form.querySelector('#phone').value.trim() || null,
                subject: form.querySelector('#subject').value,
                message: form.querySelector('#message').value.trim()
            };
        } else if (form.id === 'propertyContactForm') {
            // Property contact form
            formData = {
                fullName: form.querySelector('input[type="text"]').value.trim(),
                email: form.querySelector('input[type="email"]').value.trim(),
                phone: form.querySelector('input[type="tel"]')?.value.trim() || null,
                subject: 'Property Inquiry',
                message: form.querySelector('textarea').value.trim(),
                // Include property info if available
                propertyId: new URLSearchParams(window.location.search).get('id'),
                pageUrl: window.location.href
            };
        } else {
            // Generic form
            formData = Object.fromEntries(new FormData(form));
        }
        
        // Send to your FastAPI endpoint
        const response = await fetch('/contact/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Server responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Show success message
        showFormSuccessMessage(form);
        
        // Reset form
        form.reset();
        
        console.log('Contact message submitted successfully:', result);
        
    } catch (error) {
        console.error('Error submitting form:', error);
        
        // Show error message to user
        showFormError(form, error.message);
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        return;
    }
    
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
}

// ===== SHOW SUCCESS MESSAGE =====
function showFormSuccessMessage(form) {
    // Create or show success message
    let successDiv = form.parentElement.querySelector('.success-message');
    
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            margin-top: 20px;
            border-radius: 5px;
            border: 1px solid #c3e6cb;
            text-align: center;
        `;
        form.parentElement.appendChild(successDiv);
    }
    
    successDiv.innerHTML = `
        <h4>✓ Message Sent Successfully!</h4>
        <p>Thank you for your message. Our team will get back to you within 24 hours.</p>
    `;
    successDiv.style.display = 'block';
    
    // Hide success message after 10 seconds
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 10000);
}

// ===== SHOW ERROR MESSAGE =====
function showFormError(form, errorMessage) {
    // Create or show error message
    let errorDiv = form.parentElement.querySelector('.form-error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.style.cssText = `
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            margin-top: 20px;
            border-radius: 5px;
            border: 1px solid #f5c6cb;
            text-align: center;
        `;
        form.parentElement.appendChild(errorDiv);
    }
    
    errorDiv.innerHTML = `
        <h4>⚠️ Error Submitting Form</h4>
        <p>${errorMessage}</p>
        <p>Please try again or call us directly.</p>
    `;
    errorDiv.style.display = 'block';
    
    // Hide error message after 10 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 10000);
}

// ===== HELPER FUNCTIONS =====
function extractPriceNumber(priceString) {
    const cleaned = priceString.replace(/[$,]/g, '');
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