// CineHub UI Helper Functions
class UI {
    constructor() {
        this.config = window.CONFIG;
        this.alertContainer = null;
        this.modalStack = [];
        this.debounceTimers = new Map();
        
        this.init();
    }
    
    init() {
        this.createAlertContainer();
        this.setupGlobalEventListeners();
        this.setupModalHandlers();
        this.setupScrollEffects();
    }
    
    // Alert System
    createAlertContainer() {
        this.alertContainer = document.createElement('div');
        this.alertContainer.id = 'alertContainer';
        this.alertContainer.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm';
        document.body.appendChild(this.alertContainer);
    }
    
    showAlert(message, type = 'info', duration = 5000) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} transform translate-x-full transition-transform duration-300`;
        
        const icon = this.getAlertIcon(type);
        alert.innerHTML = `
            <div class="flex items-start">
                <i class="${icon} mr-3 mt-1"></i>
                <div class="flex-1">
                    <div class="font-medium">${message}</div>
                </div>
                <button class="ml-3 text-current opacity-70 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        this.alertContainer.appendChild(alert);
        
        // Animate in
        requestAnimationFrame(() => {
            alert.classList.remove('translate-x-full');
        });
        
        // Auto-remove
        if (this.config.UI_CONFIG.AUTO_HIDE_ALERTS && duration > 0) {
            setTimeout(() => {
                this.removeAlert(alert);
            }, duration);
        }
        
        return alert;
    }
    
    removeAlert(alert) {
        if (alert && alert.parentNode) {
            alert.classList.add('translate-x-full');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }
    }
    
    getAlertIcon(type) {
        switch (type) {
            case 'success': return 'fas fa-check-circle';
            case 'error': return 'fas fa-exclamation-circle';
            case 'warning': return 'fas fa-exclamation-triangle';
            default: return 'fas fa-info-circle';
        }
    }
    
    // Loading States
    showLoading(element, text = 'Loading...') {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element) {
            element.dataset.originalContent = element.innerHTML;
            element.innerHTML = `
                <div class="flex items-center justify-center">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    ${text}
                </div>
            `;
            element.disabled = true;
        }
    }
    
    hideLoading(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element && element.dataset.originalContent) {
            element.innerHTML = element.dataset.originalContent;
            element.disabled = false;
            delete element.dataset.originalContent;
        }
    }
    
    // Modal Utilities
    setupModalHandlers() {
        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalStack.length > 0) {
                this.closeTopModal();
            }
        });
        
        // Close modals on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeTopModal();
            }
        });
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            this.modalStack.push(modalId);
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Focus management
            const firstFocusable = modal.querySelector('input, button, textarea, select');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            
            // Remove from stack
            const index = this.modalStack.indexOf(modalId);
            if (index > -1) {
                this.modalStack.splice(index, 1);
            }
            
            // Restore body scroll if no modals open
            if (this.modalStack.length === 0) {
                document.body.style.overflow = '';
            }
        }
    }
    
    closeTopModal() {
        if (this.modalStack.length > 0) {
            const topModal = this.modalStack[this.modalStack.length - 1];
            this.closeModal(topModal);
        }
    }
    
    // Form Utilities
    validateForm(formId, rules = {}) {
        const form = document.getElementById(formId);
        if (!form) return false;
        
        let isValid = true;
        const errors = [];
        
        // Get form data
        const formData = new FormData(form);
        
        // Clear previous errors
        form.querySelectorAll('.error-message').forEach(error => error.remove());
        form.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
        
        // Validate each field
        Object.entries(rules).forEach(([fieldName, fieldRules]) => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            const value = formData.get(fieldName);
            
            if (field) {
                const fieldErrors = this.validateField(field, value, fieldRules);
                if (fieldErrors.length > 0) {
                    isValid = false;
                    errors.push(...fieldErrors);
                    this.showFieldError(field, fieldErrors[0]);
                }
            }
        });
        
        return { isValid, errors };
    }
    
    validateField(field, value, rules) {
        const errors = [];
        
        // Required validation
        if (rules.required && (!value || value.trim() === '')) {
            errors.push(`${this.getFieldLabel(field)} is required`);
            return errors; // Stop further validation if required field is empty
        }
        
        // Skip other validations if field is empty and not required
        if (!value || value.trim() === '') {
            return errors;
        }
        
        // Length validations
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${this.getFieldLabel(field)} must be at least ${rules.minLength} characters`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${this.getFieldLabel(field)} must be no more than ${rules.maxLength} characters`);
        }
        
        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(rules.patternMessage || `${this.getFieldLabel(field)} format is invalid`);
        }
        
        // Custom validation function
        if (rules.custom && typeof rules.custom === 'function') {
            const customResult = rules.custom(value);
            if (customResult !== true) {
                errors.push(customResult || `${this.getFieldLabel(field)} is invalid`);
            }
        }
        
        return errors;
    }
    
    getFieldLabel(field) {
        const label = field.parentNode.querySelector('label');
        return label ? label.textContent.replace('*', '').trim() : field.name;
    }
    
    showFieldError(field, message) {
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-400 text-sm mt-1';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }
    
    // Debounce utility
    debounce(func, delay, key = 'default') {
        clearTimeout(this.debounceTimers.get(key));
        this.debounceTimers.set(key, setTimeout(func, delay));
    }
    
    // Scroll utilities
    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const navbar = document.querySelector('nav');
            
            if (navbar) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    // Scrolling down
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollY = currentScrollY;
        }, { passive: true });
    }
    
    scrollToTop(smooth = true) {
        window.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }
    
    scrollToElement(elementId, offset = 0) {
        const element = document.getElementById(elementId);
        if (element) {
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // Animation utilities
    fadeIn(element, duration = 300) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element) {
            element.style.opacity = '0';
            element.style.display = 'block';
            
            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = (timestamp - start) / duration;
                
                element.style.opacity = Math.min(progress, 1);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        }
    }
    
    fadeOut(element, duration = 300) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element) {
            let start = null;
            const initialOpacity = parseFloat(window.getComputedStyle(element).opacity);
            
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = (timestamp - start) / duration;
                
                element.style.opacity = initialOpacity * (1 - Math.min(progress, 1));
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                }
            };
            
            requestAnimationFrame(animate);
        }
    }
    
    // Image utilities
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Search utilities
    setupSearch(inputId, resultsId, searchFunction, debounceDelay = 500) {
        const input = document.getElementById(inputId);
        const results = document.getElementById(resultsId);
        
        if (input && results) {
            input.addEventListener('input', () => {
                const query = input.value.trim();
                
                if (query.length >= 2) {
                    this.debounce(async () => {
                        this.showLoading(results, 'Searching...');
                        try {
                            await searchFunction(query, results);
                        } catch (error) {
                            console.error('Search error:', error);
                            results.innerHTML = '<div class="text-gray-400 p-4">Search failed. Please try again.</div>';
                        }
                    }, debounceDelay, `search-${inputId}`);
                } else {
                    results.innerHTML = '';
                    results.classList.add('hidden');
                }
            });
            
            // Hide results when clicking outside
            document.addEventListener('click', (e) => {
                if (!input.contains(e.target) && !results.contains(e.target)) {
                    results.classList.add('hidden');
                }
            });
            
            // Show results when focusing input
            input.addEventListener('focus', () => {
                if (results.innerHTML.trim() !== '') {
                    results.classList.remove('hidden');
                }
            });
        }
    }
    
    // Tooltip system
    setupTooltips() {
        document.addEventListener('mouseover', (e) => {
            const element = e.target.closest('[data-tooltip]');
            if (element) {
                this.showTooltip(element, element.dataset.tooltip);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const element = e.target.closest('[data-tooltip]');
            if (element) {
                this.hideTooltip();
            }
        });
    }
    
    showTooltip(element, text) {
        this.hideTooltip(); // Remove any existing tooltip
        
        const tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.className = 'absolute z-50 bg-gray-800 text-white text-sm rounded px-2 py-1 pointer-events-none';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    // Global event listeners
    setupGlobalEventListeners() {
        // Handle responsive navigation
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
        
        // Handle user dropdown
        const userMenuButton = document.getElementById('userMenuButton');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuButton && userDropdown) {
            userMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });
            
            document.addEventListener('click', () => {
                userDropdown.classList.add('hidden');
            });
        }
        
        // Handle smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                this.scrollToElement(targetId, 80); // Account for fixed navbar
            }
        });
        
        // Add loading states to buttons with data-loading attribute
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.dataset.loading !== undefined) {
                this.showLoading(e.target);
            }
        });
    }
    
    // Utility methods
    formatDate(dateString, options = {}) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options
        });
    }
    
    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        } else {
            return `${mins}m`;
        }
    }
    
    formatNumber(number) {
        return new Intl.NumberFormat().format(number);
    }
    
    truncateText(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }
    
    // Theme utilities
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }
    
    getTheme() {
        return localStorage.getItem('theme') || 'dark';
    }
    
    toggleTheme() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        return newTheme;
    }
    
    // Clipboard utilities
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showAlert('Copied to clipboard!', 'success', 2000);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            this.showAlert('Failed to copy to clipboard', 'error');
            return false;
        }
    }
    
    // Local storage utilities
    setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }
    
    getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    }
    
    removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }
}

// Create global UI instance
window.UI = new UI();

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Setup tooltips
    window.UI.setupTooltips();
    
    // Setup lazy loading for images
    window.UI.lazyLoadImages();
    
    // Apply saved theme
    const savedTheme = window.UI.getTheme();
    window.UI.setTheme(savedTheme);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}