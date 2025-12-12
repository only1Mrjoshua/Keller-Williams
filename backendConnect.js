// script.js - Updated to use backendConnect.js
// Make sure to add type="module" to your script tag in HTML

import backendConnector from './backendConnect.js';

// DOM Elements
const contactForm = document.getElementById('contactForm');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const formGroups = document.querySelectorAll('.form-group');

// Navigation toggle
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Real-time form validation
if (contactForm) {
    // Add input event listeners for real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            clearError(input);
        });
    });

    // Form submission handler
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all fields
        const isValid = validateForm();
        
        if (isValid) {
            // Get form data
            const formData = new FormData(contactForm);
            const formattedData = backendConnector.formatFormData(formData);
            
            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            try {
                // Send to backend
                const result = await backendConnector.submitContactForm(formattedData);
                
                if (result.success) {
                    // Show success message
                    showMessage('Message sent successfully! We will get back to you soon.', 'success');
                    contactForm.reset();
                } else {
                    // Show error message
                    showMessage(result.error || 'Failed to send message. Please try again.', 'error');
                    
                    // If there are validation errors from backend, display them
                    if (result.validationErrors) {
                        displayBackendErrors(result.validationErrors);
                    }
                }
            } catch (error) {
                showMessage('An unexpected error occurred. Please try again.', 'error');
                console.error('Form submission error:', error);
            } finally {
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        }
    });
}

// Field validation function
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name || field.id;
    const errorElement = field.parentElement.querySelector('.error-message');
    
    // Clear previous error
    clearError(field);
    
    // Validation rules
    if (field.required && !value) {
        showError(field, `${field.getAttribute('data-label') || fieldName} is required`);
        return false;
    }
    
    if (field.type === 'email' && value) {
        if (!backendConnector.isValidEmail(value)) {
            showError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    if (field.name === 'phone' && value) {
        if (!backendConnector.isValidPhone(value)) {
            showError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    return true;
}

// Form validation function
function validateForm() {
    let isValid = true;
    
    // Validate each required field
    const requiredFields = contactForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Error display functions
function showError(field, message) {
    const errorElement = field.parentElement.querySelector('.error-message');
    field.classList.add('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function clearError(field) {
    const errorElement = field.parentElement.querySelector('.error-message');
    field.classList.remove('error');
    errorElement.textContent = '';
    errorElement.style.display = 'none';
}

function displayBackendErrors(errors) {
    // Clear all errors first
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    
    document.querySelectorAll('input, textarea, select').forEach(field => {
        field.classList.remove('error');
    });
    
    // Display backend errors
    if (Array.isArray(errors)) {
        errors.forEach(error => {
            const field = error.loc && error.loc[1];
            if (field) {
                const inputElement = document.querySelector(`[name="${field}"]`);
                if (inputElement) {
                    showError(inputElement, error.msg);
                }
            }
        });
    }
}

// Message display function
function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;
    messageElement.style.cssText = `
        padding: 15px;
        margin: 20px 0;
        border-radius: 5px;
        text-align: center;
        font-weight: bold;
        background-color: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
    `;
    
    // Insert message
    contactForm.parentNode.insertBefore(messageElement, contactForm);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 5000);
}

// Check backend connection on page load (optional)
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Checking backend connection...');
    
    const healthCheck = await backendConnector.checkHealth();
    if (healthCheck.success) {
        console.log('✅ Backend connection successful:', healthCheck.data);
    } else {
        console.warn('⚠️ Backend connection issue:', healthCheck.error);
    }
});