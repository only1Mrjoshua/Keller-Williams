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
    initMobileNavigation();
    initSearch();
    
    if (window.location.pathname.includes('property-details.html')) {
        loadPropertyDetails();
    }
    
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        loadFeaturedProperties();
    }
    
    if (window.location.pathname.includes('listings.html')) {
        loadAllListings();
    }
    
    initContactForms();
    initOutsideClickHandler();
});

function initMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (!hamburger || !navLinks) return;
    
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
        
        if (navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

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

function initSearch() {
    const homeSearchForm = document.getElementById('searchForm');
    if (homeSearchForm) {
        homeSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleHomeSearch();
        });
    }
    
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
    
    ['priceFilter', 'propertyTypeFilter', 'bedroomsFilter'].forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', performListingsSearch);
        }
    });
    
    const clearAllBtn = document.getElementById('clearAllFilters');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllFilters);
    }
}

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
        
        const textMatch = !searchTerm || 
                         title.includes(searchTerm) || 
                         location.includes(searchTerm);
        
        let priceMatch = true;
        if (priceFilter) {
            switch (priceFilter) {
                case 'under-500k': priceMatch = priceNumber <= 500000; break;
                case '500k-1m': priceMatch = priceNumber >= 500000 && priceNumber <= 1000000; break;
                case '1m-2m': priceMatch = priceNumber >= 1000000 && priceNumber <= 2000000; break;
                case 'over-2m': priceMatch = priceNumber > 2000000; break;
            }
        }
        
        const typeMatch = !typeFilter || propertyType === typeFilter.toLowerCase();
        
        const bedroomsMatch = !bedroomsFilter || bedrooms >= parseInt(bedroomsFilter);
        
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

function updateSearchResults(count) {
    const listingCountElement = document.getElementById('listingCount');
    if (listingCountElement) {
        listingCountElement.textContent = count;
    }
    
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

function clearAllFilters() {
    document.getElementById('listingsSearch').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('propertyTypeFilter').value = '';
    document.getElementById('bedroomsFilter').value = '';
    performListingsSearch();
    document.getElementById('listingsSearch').focus();
}

function loadFeaturedProperties() {
    const featuredContainer = document.getElementById('featuredProperties');
    if (!featuredContainer) return;
    
    const featured = properties.slice(0, 3);
    let html = '';
    
    featured.forEach(property => {
        html += `
            <div class="property-card" data-id="${property.id}">
                <div class="property-img" style="background-image: url('${property.image}');"></div>
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

function loadAllListings() {
    const listingsContainer = document.getElementById('listingsContainer');
    if (!listingsContainer) return;
    
    let html = '';
    properties.forEach(property => {
        const priceNumber = extractPriceNumber(property.price);
        
        html += `
            <div class="property-card" 
                 data-id="${property.id}" 
                 data-type="${property.propertyType.toLowerCase()}" 
                 data-bedrooms="${property.bedrooms}"
                 data-price="${priceNumber}"
                 data-location="${property.location.toLowerCase()}"
                 data-title="${property.title.toLowerCase()}">
                <div class="property-img" style="background-image: url('${property.image}');"></div>
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
    
    const listingCount = document.getElementById('listingCount');
    if (listingCount) {
        listingCount.textContent = properties.length;
    }
    
    attachPropertyCardListeners();
    applyURLFilters();
    createNoResultsMessage();
    performListingsSearch();
}

function attachPropertyCardListeners() {
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const propertyId = this.getAttribute('data-id');
            window.location.href = `property-details.html?id=${propertyId}`;
        });
    });
    
    document.querySelectorAll('.property-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn') && !e.target.closest('.btn')) {
                const propertyId = this.getAttribute('data-id');
                window.location.href = `property-details.html?id=${propertyId}`;
            }
        });
    });
}

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

function updatePropertyPage(property) {
    document.title = `${property.title} - Real Estate`;
    
    const gallery = document.querySelector('.property-gallery');
    if (gallery) {
        let galleryHtml = '';
        property.gallery.forEach((img, index) => {
            const className = index === 0 ? 'gallery-main' : 'gallery-item';
            galleryHtml += `<div class="${className}" style="background-image: url('${img}');"></div>`;
        });
        gallery.innerHTML = galleryHtml;
    }
    
    const propertyTitle = document.querySelector('.property-title');
    if (propertyTitle) {
        propertyTitle.innerHTML = `
            <h1>${property.title}</h1>
            <div class="property-price">${property.price}</div>
        `;
    }
    
    const propertyLocation = document.querySelector('.property-location');
    if (propertyLocation) {
        propertyLocation.innerHTML = `<span>📍</span> ${property.location}`;
    }
    
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
                        <p><strong>Email:</strong> ${property.agent.email}</p>
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

function initContactForms() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm && !contactForm.hasAttribute('data-initialized')) {
        contactForm.setAttribute('data-initialized', 'true');
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleContactFormSubmission(this);
        });
    }
    
    initPropertyContactForm();
}

function initPropertyContactForm() {
    const propertyContactForm = document.getElementById('propertyContactForm');
    if (propertyContactForm && !propertyContactForm.hasAttribute('data-initialized')) {
        propertyContactForm.setAttribute('data-initialized', 'true');
        propertyContactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleContactFormSubmission(this);
        });
    }
}

async function handleContactFormSubmission(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = 'var(--primary-red)';
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const formData = {
        name: form.querySelector('[placeholder="Your Name"]')?.value || form.querySelector('#fullName')?.value || '',
        email: form.querySelector('[placeholder="Your Email"]')?.value || form.querySelector('#email')?.value || '',
        phone: form.querySelector('[placeholder="Your Phone"]')?.value || form.querySelector('#phone')?.value || '',
        subject: form.querySelector('#subject')?.value || 'General Inquiry',
        message: form.querySelector('textarea')?.value || ''
    };
    
    if (!formData.name || !formData.email || !formData.message) {
        alert('Please fill in all required fields: name, email, and message.');
        return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    try {
        const baseUrl = window.location.origin;
        const apiUrl = `${baseUrl}/contact/`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Thank you for your message! An agent will contact you shortly.');
            form.reset();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to send message.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Sorry, there was an error sending your message. Please try again later.');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

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