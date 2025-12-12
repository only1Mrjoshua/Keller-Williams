// backendConnect.js
// Handles all backend API connections for the contact form

class BackendConnect {
    constructor() {
        // Base URL for your backend API
        this.baseURL = "http://localhost:8000"; // Change this to your actual backend URL
        
        // API endpoints
        this.endpoints = {
            contact: "/contact/",
            health: "/health"
        };
    }

    /**
     * Check backend health status
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.health}`);
            const data = await response.json();
            return {
                success: response.ok,
                data: data,
                status: response.status
            };
        } catch (error) {
            console.error('Health check failed:', error);
            return {
                success: false,
                error: 'Backend connection failed',
                details: error.message
            };
        }
    }

    /**
     * Send contact form data to backend
     * @param {Object} formData - Contact form data
     */
    async submitContactForm(formData) {
        try {
            console.log('Sending contact form data:', formData);
            
            const response = await fetch(`${this.baseURL}${this.endpoints.contact}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const responseData = await response.json();
            
            if (!response.ok) {
                console.error('Backend error response:', responseData);
                return {
                    success: false,
                    error: responseData.detail || 'Failed to submit form',
                    validationErrors: responseData.detail || null,
                    status: response.status
                };
            }

            return {
                success: true,
                data: responseData,
                message: 'Message sent successfully!',
                status: response.status
            };

        } catch (error) {
            console.error('Error submitting contact form:', error);
            return {
                success: false,
                error: 'Network error. Please check your connection and try again.',
                details: error.message
            };
        }
    }

    /**
     * Get all contact messages (admin function)
     * @param {string} authToken - Optional authentication token
     */
    async getContactMessages(authToken = null) {
        try {
            const headers = {
                'Accept': 'application/json'
            };
            
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${this.baseURL}${this.endpoints.contact}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data,
                status: response.status
            };

        } catch (error) {
            console.error('Error fetching contact messages:', error);
            return {
                success: false,
                error: 'Failed to fetch messages',
                details: error.message
            };
        }
    }

    /**
     * Validate form data before sending
     * @param {Object} formData - Form data to validate
     */
    validateContactForm(formData) {
        const errors = {};
        
        // Required fields validation
        if (!formData.name || formData.name.trim() === '') {
            errors.name = 'Name is required';
        }
        
        if (!formData.email || formData.email.trim() === '') {
            errors.email = 'Email is required';
        } else if (!this.isValidEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!formData.subject || formData.subject.trim() === '') {
            errors.subject = 'Subject is required';
        }
        
        if (!formData.message || formData.message.trim() === '') {
            errors.message = 'Message is required';
        }
        
        // Optional phone validation
        if (formData.phone && formData.phone.trim() !== '' && !this.isValidPhone(formData.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    /**
     * Email validation helper
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Phone validation helper (basic)
     */
    isValidPhone(phone) {
        // Simple phone validation - can be enhanced based on requirements
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    /**
     * Format form data from HTML form to API format
     * @param {FormData} formData - FormData object from HTML form
     */
    formatFormData(formData) {
        return {
            name: formData.get('fullName') || '',
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            subject: formData.get('subject') || '',
            message: formData.get('message') || ''
        };
    }
}

// Create singleton instance
const backendConnector = new BackendConnect();

// Export for use in other files
export default backendConnector;