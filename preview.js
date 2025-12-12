// Image Preview Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Wait for gallery to be loaded
    setTimeout(initializeImagePreview, 500);
});

function initializeImagePreview() {
    const gallery = document.querySelector('.property-gallery');
    if (!gallery) return;
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'image-modal-overlay';
    modalOverlay.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.95);
        z-index: 9999;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'image-modal-content';
    modalContent.style.cssText = `
        position: relative;
        max-width: 90%;
        max-height: 90%;
        width: auto;
        height: auto;
    `;
    
    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
    `;
    
    // Create image element
    const modalImage = document.createElement('img');
    modalImage.className = 'modal-image';
    modalImage.style.cssText = `
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
        display: block;
        margin: 0 auto;
        cursor: zoom-in;
        transition: transform 0.3s ease;
        transform-origin: center center;
    `;
    
    // Create navigation buttons
    const prevButton = document.createElement('button');
    prevButton.className = 'modal-nav prev';
    prevButton.innerHTML = '❮';
    prevButton.style.cssText = `
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 24px;
        padding: 15px 20px;
        cursor: pointer;
        border-radius: 50%;
        transition: background 0.3s;
        z-index: 10;
    `;
    
    const nextButton = document.createElement('button');
    nextButton.className = 'modal-nav next';
    nextButton.innerHTML = '❯';
    nextButton.style.cssText = `
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 24px;
        padding: 15px 20px;
        cursor: pointer;
        border-radius: 50%;
        transition: background 0.3s;
        z-index: 10;
    `;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close';
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 30px;
        width: 50px;
        height: 50px;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: background 0.3s;
    `;
    
    // Create image counter
    const imageCounter = document.createElement('div');
    imageCounter.className = 'image-counter';
    imageCounter.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 10;
    `;
    
    // Create zoom controls
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.style.cssText = `
        position: absolute;
        bottom: 20px;
        right: 20px;
        display: flex;
        gap: 10px;
        z-index: 10;
    `;
    
    const zoomInButton = document.createElement('button');
    zoomInButton.className = 'zoom-btn zoom-in';
    zoomInButton.innerHTML = '+';
    zoomInButton.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s;
    `;
    
    const zoomOutButton = document.createElement('button');
    zoomOutButton.className = 'zoom-btn zoom-out';
    zoomOutButton.innerHTML = '−';
    zoomOutButton.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s;
    `;
    
    const resetZoomButton = document.createElement('button');
    resetZoomButton.className = 'zoom-btn reset-zoom';
    resetZoomButton.innerHTML = '⟳';
    resetZoomButton.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s;
    `;
    
    // Assemble modal
    zoomControls.appendChild(zoomInButton);
    zoomControls.appendChild(zoomOutButton);
    zoomControls.appendChild(resetZoomButton);
    
    imageContainer.appendChild(modalImage);
    imageContainer.appendChild(prevButton);
    imageContainer.appendChild(nextButton);
    imageContainer.appendChild(closeButton);
    imageContainer.appendChild(imageCounter);
    imageContainer.appendChild(zoomControls);
    
    modalContent.appendChild(imageContainer);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // State variables
    let currentImageIndex = 0;
    let allGalleryImages = [];
    let currentScale = 1;
    
    // Collect all gallery images
    function collectGalleryImages() {
        allGalleryImages = [];
        const galleryItems = gallery.querySelectorAll('.gallery-main, .gallery-item');
        
        galleryItems.forEach(item => {
            const imgElement = item.querySelector('img');
            if (imgElement) {
                allGalleryImages.push(imgElement.src);
            } else {
                // If no img element, try to get background image
                const bgImage = window.getComputedStyle(item).backgroundImage;
                const urlMatch = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                    allGalleryImages.push(urlMatch[1]);
                }
            }
        });
    }
    
    // Open modal with clicked image
    function openModal(imageIndex) {
        currentImageIndex = imageIndex;
        currentScale = 1;
        updateModalImage();
        modalOverlay.style.display = 'flex';
        
        // Trigger fade in
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
        }, 10);
        
        // Prevent scrolling on body
        document.body.style.overflow = 'hidden';
    }
    
    // Update modal image
    function updateModalImage() {
        if (allGalleryImages[currentImageIndex]) {
            modalImage.src = allGalleryImages[currentImageIndex];
            modalImage.style.transform = `scale(${currentScale})`;
            imageCounter.textContent = `${currentImageIndex + 1} / ${allGalleryImages.length}`;
        }
    }
    
    // Close modal
    function closeModal() {
        modalOverlay.style.opacity = '0';
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
    
    // Navigation functions
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % allGalleryImages.length;
        currentScale = 1;
        updateModalImage();
    }
    
    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + allGalleryImages.length) % allGalleryImages.length;
        currentScale = 1;
        updateModalImage();
    }
    
    // Zoom functions
    function zoomIn() {
        currentScale = Math.min(currentScale + 0.25, 3);
        modalImage.style.transform = `scale(${currentScale})`;
        modalImage.style.cursor = 'zoom-out';
    }
    
    function zoomOut() {
        currentScale = Math.max(currentScale - 0.25, 1);
        modalImage.style.transform = `scale(${currentScale})`;
        if (currentScale === 1) {
            modalImage.style.cursor = 'zoom-in';
        }
    }
    
    function resetZoom() {
        currentScale = 1;
        modalImage.style.transform = `scale(${currentScale})`;
        modalImage.style.cursor = 'zoom-in';
    }
    
    // Click-to-zoom toggle
    function toggleZoom(event) {
        if (currentScale === 1) {
            zoomIn();
        } else {
            resetZoom();
        }
        event.stopPropagation();
    }
    
    // Event listeners
    closeButton.addEventListener('click', closeModal);
    prevButton.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });
    nextButton.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });
    zoomInButton.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomIn();
    });
    zoomOutButton.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomOut();
    });
    resetZoomButton.addEventListener('click', (e) => {
        e.stopPropagation();
        resetZoom();
    });
    modalImage.addEventListener('click', toggleZoom);
    
    // Close modal when clicking outside image
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modalOverlay.style.display === 'flex') {
            switch(e.key) {
                case 'Escape':
                    closeModal();
                    break;
                case 'ArrowLeft':
                    showPrevImage();
                    break;
                case 'ArrowRight':
                    showNextImage();
                    break;
                case '+':
                case '=':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        zoomIn();
                    }
                    break;
                case '-':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        zoomOut();
                    }
                    break;
                case '0':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        resetZoom();
                    }
                    break;
            }
        }
    });
    
    // Add click events to gallery items
    function addGalleryClickEvents() {
        const galleryItems = gallery.querySelectorAll('.gallery-main, .gallery-item');
        
        galleryItems.forEach((item, index) => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                collectGalleryImages();
                openModal(index);
            });
        });
    }
    
    // Initialize
    addGalleryClickEvents();
    
    // Hover effects for buttons
    [prevButton, nextButton, closeButton, zoomInButton, zoomOutButton, resetZoomButton].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });
    });
}