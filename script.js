// DOM ready function
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking a link
    const mobileLinks = document.querySelectorAll('.nav-links a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });
    
    // Load property details on property-details.html
    if (window.location.pathname.includes('property-details.html')) {
        loadPropertyDetails();
    }
    
    // Initialize featured properties on homepage
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        loadFeaturedProperties();
    }
    
    // Initialize listings page
    if (window.location.pathname.includes('listings.html')) {
        loadAllListings();
    }
    
    // Handle homepage search form submission
    const homeSearchForm = document.getElementById('searchForm');
    if (homeSearchForm) {
        homeSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get search values
            const location = document.getElementById('location').value;
            const price = document.getElementById('price').value;
            const type = document.getElementById('type').value;
            
            // Build query parameters
            let queryParams = [];
            if (location) queryParams.push(`location=${location}`);
            if (price) queryParams.push(`price=${price}`);
            if (type) queryParams.push(`type=${type}`);
            
            // Redirect to listings page with filters
            const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
            window.location.href = `listings.html${queryString}`;
        });
    }
    
    // Handle contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm && !contactForm.hasAttribute('data-initialized')) {
        contactForm.setAttribute('data-initialized', 'true');
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! An agent will contact you shortly.');
            contactForm.reset();
        });
    }
});

// Load featured properties on homepage
function loadFeaturedProperties() {
    const featuredContainer = document.getElementById('featuredProperties');
    if (!featuredContainer) return;
    
    // Get first 3 properties as featured
    const featured = properties.slice(0, 3);
    
    let html = '';
    featured.forEach(property => {
        html += `
            <div class="property-card" data-id="${property.id}">
                <!-- CHANGE: Use actual image instead of placeholder -->
                <div class="property-img" style="background-image: url('${property.image}');">
                    <!-- Remove the span or keep it as fallback -->
                    <!-- <span style="display: none;">Property Image ${property.id}</span> -->
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
    
    // Attach event listeners
    attachListingEventListeners();
}

// Load all listings on listings page with enhanced data attributes
function loadAllListings() {
    const listingsContainer = document.getElementById('listingsContainer');
    if (!listingsContainer) return;
    
    let html = '';
    properties.forEach(property => {
        // Convert price to numeric value for filtering
        const priceNumber = extractPriceNumber(property.price);
        
        html += `
            <div class="property-card" 
                 data-id="${property.id}" 
                 data-type="${property.propertyType.toLowerCase()}" 
                 data-bedrooms="${property.bedrooms}"
                 data-price="${priceNumber}"
                 data-location="${property.location.toLowerCase()}"
                 data-title="${property.title.toLowerCase()}">
                <!-- CHANGE: Use actual image instead of placeholder -->
                <div class="property-img" style="background-image: url('${property.image}');">
                    <!-- Remove the span or keep it as fallback -->
                    <!-- <span style="display: none;">Property Image ${property.id}</span> -->
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
    
    // Attach event listeners
    attachListingEventListeners();
    
    // Check for URL parameters and apply filters
    applyURLFilters();
    
    // Initialize search functionality
    initializeSearch();
}

// Attach event listeners to listings
function attachListingEventListeners() {
    // Handle "View Details" button clicks
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const propertyId = this.getAttribute('data-id');
            window.location.href = `property-details.html?id=${propertyId}`;
        });
    });
    
    // Handle property card clicks
    document.querySelectorAll('.property-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn') && !e.target.closest('.btn')) {
                const propertyId = this.getAttribute('data-id');
                window.location.href = `property-details.html?id=${propertyId}`;
            }
        });
    });
}

// Initialize search functionality on listings page
function initializeSearch() {
    const searchInput = document.getElementById('listingsSearch');
    const priceFilter = document.getElementById('priceFilter');
    const typeFilter = document.getElementById('propertyTypeFilter');
    const bedroomsFilter = document.getElementById('bedroomsFilter');
    const clearAllBtn = document.getElementById('clearAllFilters');
    
    if (!searchInput) return; // Not on listings page
    
    // Create no results message if it doesn't exist
    createNoResultsMessage();
    
    // Function to perform search with all filters
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const priceValue = priceFilter ? priceFilter.value : '';
        const typeValue = typeFilter ? typeFilter.value : '';
        const bedroomsValue = bedroomsFilter ? bedroomsFilter.value : '';
        
        const listingCards = document.querySelectorAll('.property-card');
        let visibleCount = 0;
        
        listingCards.forEach(card => {
            // Get property data from data attributes
            const title = card.getAttribute('data-title') || '';
            const location = card.getAttribute('data-location') || '';
            const priceNumber = parseFloat(card.getAttribute('data-price') || 0);
            const propertyType = card.getAttribute('data-type') || '';
            const bedrooms = parseInt(card.getAttribute('data-bedrooms') || 0);
            
            // Check text search (search in title or location)
            let textMatch = true;
            if (searchTerm !== '') {
                textMatch = title.includes(searchTerm) || location.includes(searchTerm);
            }
            
            // Check price filter
            let priceMatch = true;
            if (priceValue) {
                switch (priceValue) {
                    case 'under-500k':
                        priceMatch = priceNumber <= 500000;
                        break;
                    case '500k-1m':
                        priceMatch = priceNumber >= 500000 && priceNumber <= 1000000;
                        break;
                    case '1m-2m':
                        priceMatch = priceNumber >= 1000000 && priceNumber <= 2000000;
                        break;
                    case 'over-2m':
                        priceMatch = priceNumber > 2000000;
                        break;
                }
            }
            
            // Check type filter
            const typeMatch = typeValue === '' || propertyType === typeValue.toLowerCase();
            
            // Check bedrooms filter
            const bedroomsMatch = bedroomsValue === '' || bedrooms >= parseInt(bedroomsValue);
            
            // Show/hide card based on all filters
            if (textMatch && priceMatch && typeMatch && bedroomsMatch) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update results
        updateSearchResults(visibleCount);
    }
    
    // Update search results display
    function updateSearchResults(count) {
        // Update count
        const listingCountElement = document.getElementById('listingCount');
        if (listingCountElement) {
            listingCountElement.textContent = count;
        }
        
        // Show/hide no results message
        const messageDiv = document.getElementById('noResultsMessage');
        const searchInput = document.getElementById('listingsSearch');
        const priceFilter = document.getElementById('priceFilter');
        const typeFilter = document.getElementById('propertyTypeFilter');
        const bedroomsFilter = document.getElementById('bedroomsFilter');
        
        const hasFilters = searchInput.value || 
                          (priceFilter && priceFilter.value !== '') || 
                          (typeFilter && typeFilter.value !== '') || 
                          (bedroomsFilter && bedroomsFilter.value !== '');
        
        if (count === 0 && hasFilters) {
            messageDiv.style.display = 'block';
        } else {
            messageDiv.style.display = 'none';
        }
    }
    
    // Create no results message
    function createNoResultsMessage() {
        const listingsContainer = document.querySelector('.listings-grid');
        if (listingsContainer && !document.getElementById('noResultsMessage')) {
            const messageDiv = document.createElement('div');
            messageDiv.id = 'noResultsMessage';
            messageDiv.className = 'no-results-message';
            messageDiv.style.display = 'none';
            messageDiv.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--medium-grey); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--dark-grey); margin-bottom: 10px;">No Properties Match Your Criteria</h3>
                    <p style="color: var(--medium-grey); max-width: 500px; margin: 0 auto 30px;">
                        Try adjusting your search filters or browse all properties.
                    </p>
                    <button id="clearSearchBtn" class="btn">Clear All Filters</button>
                </div>
            `;
            listingsContainer.parentNode.insertBefore(messageDiv, listingsContainer.nextSibling);
            
            // Add event listener to clear button
            document.getElementById('clearSearchBtn').addEventListener('click', clearAllFilters);
        }
    }
    
    // Clear all filters
    function clearAllFilters() {
        if (searchInput) searchInput.value = '';
        if (priceFilter) priceFilter.value = '';
        if (typeFilter) typeFilter.value = '';
        if (bedroomsFilter) bedroomsFilter.value = '';
        performSearch();
        if (searchInput) searchInput.focus();
    }
    
    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                performSearch();
            }
        });
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', performSearch);
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', performSearch);
    }
    
    if (bedroomsFilter) {
        bedroomsFilter.addEventListener('change', performSearch);
    }
    
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllFilters);
    }
    
    // Initial search to show all listings
    performSearch();
}

// Apply URL filters from homepage
function applyURLFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Get filters from URL
    const locationParam = urlParams.get('location');
    const priceParam = urlParams.get('price');
    const typeParam = urlParams.get('type');
    
    // Apply filters if they exist
    if (locationParam || priceParam || typeParam) {
        // Set search input if we have text search
        const searchInput = document.getElementById('listingsSearch');
        if (searchInput && locationParam) {
            // Convert location parameter to searchable text
            const locationText = locationParam.charAt(0).toUpperCase() + locationParam.slice(1);
            searchInput.value = locationText;
        }
        
        // Set price filter
        if (priceParam) {
            const priceFilter = document.getElementById('priceFilter');
            if (priceFilter) {
                priceFilter.value = priceParam;
            }
        }
        
        // Set type filter
        if (typeParam) {
            const typeFilter = document.getElementById('propertyTypeFilter');
            if (typeFilter) {
                typeFilter.value = typeParam;
            }
        }
    }
}

// Helper function to extract price number from price string
function extractPriceNumber(priceString) {
    // Remove currency symbols, commas, and spaces
    const cleaned = priceString.replace(/[$,]/g, '');
    // Extract the first number (handles ranges like "$500,000 - $600,000")
    const matches = cleaned.match(/(\d+(?:\.\d+)?)/);
    return matches ? parseFloat(matches[1]) : 0;
}

// Load property details on property details page
function loadPropertyDetails() {
    // Get property ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = parseInt(urlParams.get('id'));
    
    if (!propertyId || isNaN(propertyId)) {
        document.querySelector('.property-details').innerHTML = `
            <div class="container">
                <h2>Property Not Found</h2>
                <p>Sorry, the property you're looking for doesn't exist.</p>
                <a href="listings.html" class="btn">Back to Listings</a>
            </div>
        `;
        return;
    }
    
    // Find the property
    const property = properties.find(p => p.id === propertyId);
    
    if (!property) {
        document.querySelector('.property-details').innerHTML = `
            <div class="container">
                <h2>Property Not Found</h2>
                <p>Sorry, the property you're looking for doesn't exist.</p>
                <a href="listings.html" class="btn">Back to Listings</a>
            </div>
        `;
        return;
    }
    
    // Update page title
    document.title = `${property.title} - Real Estate`;
    
    // Create gallery HTML
// In loadPropertyDetails() function, update the gallery creation:
    let galleryHtml = '';
    property.gallery.forEach((img, index) => {
        if (index === 0) {
            galleryHtml += `
                <div class="gallery-main" style="background-image: url('${img}');">
                </div>`;
        } else {
            galleryHtml += `
                <div class="gallery-item" style="background-image: url('${img}');">
                </div>`;
        }
    });
    
    // Create features HTML
    let featuresHtml = '';
    property.features.forEach(feature => {
        featuresHtml += `
            <div class="feature-item">
                <div class="feature-icon">✓</div>
                <span>${feature}</span>
            </div>
        `;
    });
    
    // Update the property details content
    const propertyContent = document.querySelector('.property-content');
    if (propertyContent) {
        propertyContent.innerHTML = `
            <div class="property-description">
                <h3>Property Description</h3>
                <p>${property.fullDescription}</p>
                
                <h3>Property Features</h3>
                <div class="property-features">
                    ${featuresHtml}
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
        propertyLocation.innerHTML = `
            <span>📍</span> ${property.location}
        `;
    }
    
    // Update gallery
    const propertyGallery = document.querySelector('.property-gallery');
    if (propertyGallery) {
        propertyGallery.innerHTML = galleryHtml;
    }
    
    // Re-attach event listener to contact form
    const contactForm = document.getElementById('propertyContactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! An agent will contact you shortly.');
            contactForm.reset();
        });
    }
}