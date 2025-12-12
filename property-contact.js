// property-contact.js - Independent contact form handler for property details page
class ToastNotification {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
      this.addToastStyles();
    } else {
      this.container = document.querySelector('.toast-container');
    }
  }

  addToastStyles() {
    const style = document.createElement('style');
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
      
      .toast.warning {
        background-color: #f59e0b;
        border-left: 4px solid #d97706;
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

  show(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.innerHTML = type === 'success' ? '✓' : type === 'error' ? '✗' : '⚠';
    
    const messageElement = document.createElement('span');
    messageElement.className = 'toast-message';
    messageElement.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(messageElement);
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}

// Create global toast instance
const toast = new ToastNotification();

// Main form handler function
function initPropertyContactForm() {
  // Find the property contact form
  const propertyContactForm = document.getElementById('propertyContactForm');
  
  if (!propertyContactForm) {
    console.log('Property contact form not found on this page.');
    return;
  }
  
  // Remove any existing event listeners by cloning the form
  const newForm = propertyContactForm.cloneNode(true);
  propertyContactForm.parentNode.replaceChild(newForm, propertyContactForm);
  
  const freshForm = document.getElementById('propertyContactForm');
  
  // Add new submit event listener
  freshForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // Disable submit button
    const submitButton = freshForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Get property ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    
    // Get property title for the message
    const propertyTitle = document.querySelector('.property-title h1')?.textContent || 'Property Inquiry';
    
    // Collect form data
    const formInputs = freshForm.querySelectorAll('input, textarea');
    const formData = {};
    
    formInputs.forEach(input => {
      if (input.type !== 'submit') {
        formData[input.name || input.type] = input.value.trim();
      }
    });
    
    // Prepare data for the agent endpoint
    const agentFormData = {
      name: formData.text || '', // Your name field (text input)
      email: formData.email || '',
      phone: formData.tel || null,
      message: formData.textarea || ''
    };
    
    // Add property info to message if available
    if (propertyId) {
      agentFormData.message = `Property Inquiry for: ${propertyTitle}\nProperty ID: ${propertyId}\n\nMessage:\n${agentFormData.message}`;
    }
    
    // Validate required fields
    if (!agentFormData.name || !agentFormData.email || !agentFormData.message) {
      toast.show('Please fill in all required fields.', 'warning');
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
      return;
    }
    
    try {
      // Send to the agent contact endpoint (form data)
      const response = await fetch('http://localhost:8000/agent/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(agentFormData).toString()
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);
        toast.show('Message sent successfully! We\'ll get back to you soon.', 'success');
        
        // Reset the form
        freshForm.reset();
        
        // Also optionally send to the regular contact endpoint
        try {
          const regularContactData = {
            name: agentFormData.name,
            email: agentFormData.email,
            phone: agentFormData.phone,
            subject: propertyTitle,
            message: agentFormData.message
          };
          
          await fetch('http://localhost:8000/contact/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(regularContactData)
          });
        } catch (secondaryError) {
          console.log('Secondary contact endpoint failed, but primary succeeded:', secondaryError);
        }
        
      } else {
        // Try JSON endpoint if form endpoint fails
        console.log('Form endpoint failed, trying JSON endpoint...');
        
        const jsonResponse = await fetch('http://localhost:8000/agent/contact/json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(agentFormData)
        });
        
        if (jsonResponse.ok) {
          const data = await jsonResponse.json();
          console.log('Success via JSON:', data);
          toast.show('Message sent successfully!', 'success');
          freshForm.reset();
        } else {
          // Try to get error details from response
          let errorMessage = 'Failed to send message';
          try {
            const errorData = await jsonResponse.json();
            errorMessage = errorData.detail || errorMessage;
          } catch (e) {
            errorMessage = `Server responded with status: ${jsonResponse.status}`;
          }
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.show(`Failed to send message: ${error.message}`, 'error');
    } finally {
      // Re-enable submit button
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });
  
  // Add input validation styles
  const inputs = freshForm.querySelectorAll('input[required], textarea[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value.trim() === '') {
        this.style.borderColor = '#ef4444';
      } else {
        this.style.borderColor = '';
      }
    });
    
    input.addEventListener('input', function() {
      if (this.value.trim() !== '') {
        this.style.borderColor = '';
      }
    });
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on a property details page
  if (window.location.pathname.includes('property-details.html') || 
      document.querySelector('.property-details')) {
    
    // Wait a bit to ensure the form is loaded by the main script
    setTimeout(() => {
      initPropertyContactForm();
    }, 500);
    
    // Also try to initialize on any DOM changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          const hasPropertyForm = Array.from(mutation.addedNodes).some(node => 
            node.nodeType === 1 && node.querySelector && node.querySelector('#propertyContactForm')
          );
          if (hasPropertyForm) {
            initPropertyContactForm();
          }
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
});