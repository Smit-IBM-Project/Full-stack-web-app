// CineHub Configuration
class Config {
    constructor() {
        // TMDB API Configuration (Read-only key - safe for client-side use)
        this.TMDB_API_KEY = 'b3c1147b77da67611d00db290e992207';
        this.TMDB_BASE_URL = 'https://api.themoviedb.org/3';
        this.TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
        this.TMDB_BACKDROP_SIZE = 'original';
        this.TMDB_POSTER_SIZE = 'w500';
        this.TMDB_PROFILE_SIZE = 'w185';
        
        // Application Configuration
        this.APP_NAME = 'CineHub';
        this.APP_VERSION = '1.0.0';
        this.DEFAULT_LANGUAGE = 'en-US';
        this.DEFAULT_REGION = 'US';
        
        // Pagination & Limits
        this.MOVIES_PER_PAGE = 20;
        this.REVIEWS_PER_PAGE = 10;
        this.MAX_SEARCH_RESULTS = 50;
        this.CACHE_DURATION = 300000; // 5 minutes in milliseconds
        
        // Rating System
        this.MIN_RATING = 1;
        this.MAX_RATING = 10;
        this.RATING_PRECISION = 1; // 1 = whole numbers, 0.5 = half stars
        
        // Local Storage Keys
        this.STORAGE_KEYS = {
            USER_SESSION: 'cinehub_user_session',
            USER_PREFERENCES: 'cinehub_user_preferences',
            CACHED_MOVIES: 'cinehub_cached_movies',
            SEARCH_HISTORY: 'cinehub_search_history',
            THEME_PREFERENCE: 'cinehub_theme'
        };
        
        // API Endpoints
        this.API_ENDPOINTS = {
            // TMDB Endpoints
            TRENDING_MOVIES: '/trending/movie/week',
            POPULAR_MOVIES: '/movie/popular',
            TOP_RATED_MOVIES: '/movie/top_rated',
            NOW_PLAYING: '/movie/now_playing',
            UPCOMING_MOVIES: '/movie/upcoming',
            MOVIE_DETAILS: '/movie/{id}',
            MOVIE_CREDITS: '/movie/{id}/credits',
            MOVIE_VIDEOS: '/movie/{id}/videos',
            MOVIE_REVIEWS: '/movie/{id}/reviews',
            MOVIE_SIMILAR: '/movie/{id}/similar',
            MOVIE_RECOMMENDATIONS: '/movie/{id}/recommendations',
            SEARCH_MOVIES: '/search/movie',
            GENRES: '/genre/movie/list',
            DISCOVER_MOVIES: '/discover/movie',
            
            // Internal API Endpoints (RESTful Table API)
            USERS: 'tables/users',
            MOVIES: 'tables/movies',
            REVIEWS: 'tables/reviews',
            RATINGS: 'tables/ratings',
            WATCHLIST: 'tables/watchlist',
            REVIEW_LIKES: 'tables/review_likes'
        };
        
        // Error Messages
        this.ERROR_MESSAGES = {
            NETWORK_ERROR: 'Network error. Please check your connection.',
            API_LIMIT_EXCEEDED: 'API rate limit exceeded. Please try again later.',
            UNAUTHORIZED: 'Authentication required. Please log in.',
            FORBIDDEN: 'Access denied.',
            NOT_FOUND: 'Resource not found.',
            SERVER_ERROR: 'Server error. Please try again later.',
            INVALID_DATA: 'Invalid data provided.',
            VALIDATION_ERROR: 'Please check your input and try again.',
            TMDB_API_KEY_MISSING: 'TMDB API key not configured. Please add your API key to config.js'
        };
        
        // Success Messages
        this.SUCCESS_MESSAGES = {
            LOGIN_SUCCESS: 'Successfully logged in!',
            REGISTER_SUCCESS: 'Account created successfully!',
            REVIEW_SAVED: 'Review saved successfully!',
            RATING_SAVED: 'Rating saved successfully!',
            ADDED_TO_WATCHLIST: 'Added to your watchlist!',
            REMOVED_FROM_WATCHLIST: 'Removed from your watchlist!',
            PROFILE_UPDATED: 'Profile updated successfully!'
        };
        
        // UI Configuration
        this.UI_CONFIG = {
            ANIMATION_DURATION: 300,
            DEBOUNCE_DELAY: 500,
            TOAST_DURATION: 3000,
            MODAL_ANIMATION_DURATION: 200,
            LOADING_DELAY: 100,
            AUTO_HIDE_ALERTS: true
        };
        
        // Feature Flags
        this.FEATURES = {
            USER_AUTHENTICATION: true,
            MOVIE_REVIEWS: true,
            MOVIE_RATINGS: true,
            WATCHLIST: true,
            SOCIAL_FEATURES: true,
            ADVANCED_SEARCH: true,
            MOVIE_RECOMMENDATIONS: true,
            USER_PROFILES: true,
            DARK_THEME: true,
            OFFLINE_SUPPORT: false
        };
        
        // Validation Rules
        this.VALIDATION = {
            USERNAME: {
                MIN_LENGTH: 3,
                MAX_LENGTH: 20,
                PATTERN: /^[a-zA-Z0-9_]+$/
            },
            PASSWORD: {
                MIN_LENGTH: 8,
                MAX_LENGTH: 128,
                REQUIRE_UPPERCASE: true,
                REQUIRE_LOWERCASE: true,
                REQUIRE_NUMBER: true,
                REQUIRE_SPECIAL: false
            },
            EMAIL: {
                PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            REVIEW: {
                TITLE_MAX_LENGTH: 100,
                CONTENT_MIN_LENGTH: 10,
                CONTENT_MAX_LENGTH: 2000
            }
        };
        
        // Image Placeholders
        this.PLACEHOLDERS = {
            MOVIE_POSTER: 'https://via.placeholder.com/500x750/374151/ffffff?text=No+Poster',
            MOVIE_BACKDROP: 'https://via.placeholder.com/1920x1080/374151/ffffff?text=No+Backdrop',
            PROFILE_AVATAR: 'https://via.placeholder.com/200x200/ef4444/ffffff?text=User'
        };
        
        // Initialize configuration
        this.init();
    }
    
    init() {
        // Check if TMDB API key is configured
        if (this.TMDB_API_KEY === 'YOUR_TMDB_API_KEY' || !this.TMDB_API_KEY) {
            console.warn('TMDB API key not configured. Some features may not work properly.');
            this.showApiKeyWarning();
        } else {
            console.log('TMDB API key configured successfully!');
        }
        
        // Load user preferences from localStorage
        this.loadUserPreferences();
        
        // Set up error handling
        this.setupErrorHandling();
    }
    
    loadUserPreferences() {
        const preferences = this.getStorageItem(this.STORAGE_KEYS.USER_PREFERENCES);
        if (preferences) {
            // Apply saved preferences
            if (preferences.language) {
                this.DEFAULT_LANGUAGE = preferences.language;
            }
            if (preferences.region) {
                this.DEFAULT_REGION = preferences.region;
            }
        }
    }
    
    setupErrorHandling() {
        // Global error handler for unhandled promises
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showError('An unexpected error occurred. Please try again.');
        });
        
        // Global error handler for JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);
            this.showError('An application error occurred. Please refresh the page.');
        });
    }
    
    showApiKeyWarning() {
        const warning = document.createElement('div');
        warning.className = 'alert alert-warning fixed top-4 right-4 z-50 max-w-sm';
        warning.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <div>
                    <strong>Configuration Required</strong>
                    <p class="text-sm mt-1">Please add your TMDB API key to js/config.js</p>
                    <a href="https://www.themoviedb.org/settings/api" target="_blank" class="text-sm underline">Get API Key</a>
                </div>
            </div>
        `;
        document.body.appendChild(warning);
        
        setTimeout(() => {
            warning.remove();
        }, 10000);
    }
    
    showError(message) {
        // Simple error display - can be enhanced with a proper notification system
        console.error(message);
        if (window.UI && window.UI.showAlert) {
            window.UI.showAlert(message, 'error');
        }
    }
    
    // Helper methods for configuration access
    getTmdbApiKey() {
        return this.TMDB_API_KEY;
    }
    
    getTmdbUrl(endpoint, params = {}) {
        let url = this.TMDB_BASE_URL + endpoint;
        
        // Add API key
        params.api_key = this.TMDB_API_KEY;
        
        // Add default language and region if not specified
        if (!params.language) {
            params.language = this.DEFAULT_LANGUAGE;
        }
        if (!params.region) {
            params.region = this.DEFAULT_REGION;
        }
        
        // Build query string
        const queryString = new URLSearchParams(params).toString();
        return `${url}?${queryString}`;
    }
    
    getTmdbImageUrl(path, size = 'w500') {
        if (!path) return this.PLACEHOLDERS.MOVIE_POSTER;
        return `${this.TMDB_IMAGE_BASE_URL}/${size}${path}`;
    }
    
    getStorageItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }
    
    setStorageItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    }
    
    removeStorageItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
    
    // Feature flag checker
    isFeatureEnabled(feature) {
        return this.FEATURES[feature] || false;
    }
    
    // Validation helper
    validateInput(type, value) {
        const rules = this.VALIDATION[type.toUpperCase()];
        if (!rules) return { valid: true };
        
        const result = { valid: true, errors: [] };
        
        switch (type.toLowerCase()) {
            case 'username':
                if (value.length < rules.MIN_LENGTH) {
                    result.errors.push(`Username must be at least ${rules.MIN_LENGTH} characters`);
                }
                if (value.length > rules.MAX_LENGTH) {
                    result.errors.push(`Username must be no more than ${rules.MAX_LENGTH} characters`);
                }
                if (!rules.PATTERN.test(value)) {
                    result.errors.push('Username can only contain letters, numbers, and underscores');
                }
                break;
                
            case 'password':
                if (value.length < rules.MIN_LENGTH) {
                    result.errors.push(`Password must be at least ${rules.MIN_LENGTH} characters`);
                }
                if (rules.REQUIRE_UPPERCASE && !/[A-Z]/.test(value)) {
                    result.errors.push('Password must contain at least one uppercase letter');
                }
                if (rules.REQUIRE_LOWERCASE && !/[a-z]/.test(value)) {
                    result.errors.push('Password must contain at least one lowercase letter');
                }
                if (rules.REQUIRE_NUMBER && !/\d/.test(value)) {
                    result.errors.push('Password must contain at least one number');
                }
                break;
                
            case 'email':
                if (!rules.PATTERN.test(value)) {
                    result.errors.push('Please enter a valid email address');
                }
                break;
        }
        
        result.valid = result.errors.length === 0;
        return result;
    }
}

// Create global config instance
window.CONFIG = new Config();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}