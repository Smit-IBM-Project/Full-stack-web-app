// CineHub API Handler
class API {
    constructor() {
        this.config = window.CONFIG;
        this.cache = new Map();
        this.requestQueue = [];
        this.isOnline = navigator.onLine;
        
        // Set up network status monitoring
        this.setupNetworkMonitoring();
        
        // Rate limiting
        this.lastRequestTime = 0;
        this.minRequestInterval = 200; // Minimum 200ms between requests
    }
    
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processRequestQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }
    
    // Generic HTTP request method
    async request(url, options = {}) {
        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            await this.delay(this.minRequestInterval - timeSinceLastRequest);
        }
        this.lastRequestTime = Date.now();
        
        // Default options
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        // Add authorization if user is logged in
        const user = this.getLoggedInUser();
        if (user && !url.includes('themoviedb.org')) {
            finalOptions.headers.Authorization = `Bearer ${user.token}`;
        }
        
        try {
            // Check cache first for GET requests
            if (finalOptions.method === 'GET') {
                const cached = this.getFromCache(url);
                if (cached) {
                    return cached;
                }
            }
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);
            
            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache successful GET requests
            if (finalOptions.method === 'GET') {
                this.setCache(url, data);
            }
            
            return data;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            
            if (!this.isOnline) {
                throw new Error('No internet connection');
            }
            
            throw error;
        }
    }
    
    // TMDB API Methods
    async getTrendingMovies(page = 1) {
        const url = this.config.getTmdbUrl(this.config.API_ENDPOINTS.TRENDING_MOVIES, { page });
        return this.request(url);
    }
    
    async getPopularMovies(page = 1) {
        const url = this.config.getTmdbUrl(this.config.API_ENDPOINTS.POPULAR_MOVIES, { page });
        return this.request(url);
    }
    
    async getTopRatedMovies(page = 1) {
        const url = this.config.getTmdbUrl(this.config.API_ENDPOINTS.TOP_RATED_MOVIES, { page });
        return this.request(url);
    }
    
    async getNowPlayingMovies(page = 1) {
        const url = this.config.getTmdbUrl(this.config.API_ENDPOINTS.NOW_PLAYING, { page });
        return this.request(url);
    }
    
    async getUpcomingMovies(page = 1) {
        const url = this.config.getTmdbUrl(this.config.API_ENDPOINTS.UPCOMING_MOVIES, { page });
        return this.request(url);
    }
    
    async getMovieDetails(movieId) {
        const endpoint = this.config.API_ENDPOINTS.MOVIE_DETAILS.replace('{id}', movieId);
        const url = this.config.getTmdbUrl(endpoint, { 
            append_to_response: 'credits,videos,reviews,similar,recommendations'
        });
        return this.request(url);
    }
    
    async getMovieCredits(movieId) {
        const endpoint = this.config.API_ENDPOINTS.MOVIE_CREDITS.replace('{id}', movieId);
        const url = this.config.getTmdbUrl(endpoint);
        return this.request(url);
    }
    
    async searchMovies(query, page = 1) {
        const url = this.config.getTmdbUrl(this.config.API_ENDPOINTS.SEARCH_MOVIES, {
            query: encodeURIComponent(query),
            page
        });
        return this.request(url);
    }
    
    async getMovieGenres() {
        const url = this.config.getTmdbUrl(this.config.API_ENDPOINTS.GENRES);
        return this.request(url);
    }
    
    async discoverMovies(filters = {}, page = 1) {
        const params = { ...filters, page };
        const url = this.config.getTmdbUrl(this.config.API_ENDPOINTS.DISCOVER_MOVIES, params);
        return this.request(url);
    }
    
    // Internal API Methods (RESTful Table API)
    
    // User Methods
    async createUser(userData) {
        return this.request(this.config.API_ENDPOINTS.USERS, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    async getUserById(userId) {
        return this.request(`${this.config.API_ENDPOINTS.USERS}/${userId}`);
    }
    
    async updateUser(userId, userData) {
        return this.request(`${this.config.API_ENDPOINTS.USERS}/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }
    
    async getUserByEmail(email) {
        return this.request(`${this.config.API_ENDPOINTS.USERS}?search=${encodeURIComponent(email)}`);
    }
    
    // Movie Methods
    async saveMovie(movieData) {
        return this.request(this.config.API_ENDPOINTS.MOVIES, {
            method: 'POST',
            body: JSON.stringify(movieData)
        });
    }
    
    async getMovie(movieId) {
        return this.request(`${this.config.API_ENDPOINTS.MOVIES}/${movieId}`);
    }
    
    // Review Methods
    async createReview(reviewData) {
        return this.request(this.config.API_ENDPOINTS.REVIEWS, {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }
    
    async getReviews(movieId, page = 1, limit = 10) {
        const params = new URLSearchParams({
            search: movieId,
            page: page.toString(),
            limit: limit.toString(),
            sort: 'created_at'
        });
        return this.request(`${this.config.API_ENDPOINTS.REVIEWS}?${params}`);
    }
    
    async getUserReviews(userId, page = 1, limit = 10) {
        const params = new URLSearchParams({
            search: userId,
            page: page.toString(),
            limit: limit.toString(),
            sort: 'created_at'
        });
        return this.request(`${this.config.API_ENDPOINTS.REVIEWS}?${params}`);
    }
    
    async updateReview(reviewId, reviewData) {
        return this.request(`${this.config.API_ENDPOINTS.REVIEWS}/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        });
    }
    
    async deleteReview(reviewId) {
        return this.request(`${this.config.API_ENDPOINTS.REVIEWS}/${reviewId}`, {
            method: 'DELETE'
        });
    }
    
    // Rating Methods
    async createOrUpdateRating(ratingData) {
        // First check if rating exists
        const existingRating = await this.getUserMovieRating(ratingData.user_id, ratingData.movie_id);
        
        if (existingRating && existingRating.data && existingRating.data.length > 0) {
            // Update existing rating
            const ratingId = existingRating.data[0].id;
            return this.request(`${this.config.API_ENDPOINTS.RATINGS}/${ratingId}`, {
                method: 'PUT',
                body: JSON.stringify(ratingData)
            });
        } else {
            // Create new rating
            return this.request(this.config.API_ENDPOINTS.RATINGS, {
                method: 'POST',
                body: JSON.stringify(ratingData)
            });
        }
    }
    
    async getUserMovieRating(userId, movieId) {
        const params = new URLSearchParams({
            search: `user_id:${userId} AND movie_id:${movieId}`
        });
        return this.request(`${this.config.API_ENDPOINTS.RATINGS}?${params}`);
    }
    
    async getMovieRatings(movieId) {
        const params = new URLSearchParams({
            search: movieId,
            sort: 'created_at'
        });
        return this.request(`${this.config.API_ENDPOINTS.RATINGS}?${params}`);
    }
    
    // Watchlist Methods
    async addToWatchlist(watchlistData) {
        return this.request(this.config.API_ENDPOINTS.WATCHLIST, {
            method: 'POST',
            body: JSON.stringify(watchlistData)
        });
    }
    
    async removeFromWatchlist(userId, movieId) {
        // First find the watchlist entry
        const params = new URLSearchParams({
            search: `user_id:${userId} AND movie_id:${movieId}`
        });
        const response = await this.request(`${this.config.API_ENDPOINTS.WATCHLIST}?${params}`);
        
        if (response.data && response.data.length > 0) {
            const watchlistId = response.data[0].id;
            return this.request(`${this.config.API_ENDPOINTS.WATCHLIST}/${watchlistId}`, {
                method: 'DELETE'
            });
        }
        
        throw new Error('Movie not found in watchlist');
    }
    
    async getUserWatchlist(userId, page = 1, limit = 20) {
        const params = new URLSearchParams({
            search: userId,
            page: page.toString(),
            limit: limit.toString(),
            sort: 'added_at'
        });
        return this.request(`${this.config.API_ENDPOINTS.WATCHLIST}?${params}`);
    }
    
    async isInWatchlist(userId, movieId) {
        const params = new URLSearchParams({
            search: `user_id:${userId} AND movie_id:${movieId}`
        });
        const response = await this.request(`${this.config.API_ENDPOINTS.WATCHLIST}?${params}`);
        return response.data && response.data.length > 0;
    }
    
    async markAsWatched(userId, movieId) {
        // Find the watchlist entry and update it
        const params = new URLSearchParams({
            search: `user_id:${userId} AND movie_id:${movieId}`
        });
        const response = await this.request(`${this.config.API_ENDPOINTS.WATCHLIST}?${params}`);
        
        if (response.data && response.data.length > 0) {
            const watchlistEntry = response.data[0];
            return this.request(`${this.config.API_ENDPOINTS.WATCHLIST}/${watchlistEntry.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...watchlistEntry,
                    watched: true,
                    watched_at: new Date().toISOString()
                })
            });
        }
        
        throw new Error('Movie not found in watchlist');
    }
    
    // Review Likes Methods
    async likeReview(userId, reviewId, isLike = true) {
        // Check if user already liked/disliked this review
        const existingLike = await this.getUserReviewLike(userId, reviewId);
        
        if (existingLike && existingLike.data && existingLike.data.length > 0) {
            const likeId = existingLike.data[0].id;
            return this.request(`${this.config.API_ENDPOINTS.REVIEW_LIKES}/${likeId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    user_id: userId,
                    review_id: reviewId,
                    is_like: isLike,
                    created_at: new Date().toISOString()
                })
            });
        } else {
            return this.request(this.config.API_ENDPOINTS.REVIEW_LIKES, {
                method: 'POST',
                body: JSON.stringify({
                    user_id: userId,
                    review_id: reviewId,
                    is_like: isLike,
                    created_at: new Date().toISOString()
                })
            });
        }
    }
    
    async getUserReviewLike(userId, reviewId) {
        const params = new URLSearchParams({
            search: `user_id:${userId} AND review_id:${reviewId}`
        });
        return this.request(`${this.config.API_ENDPOINTS.REVIEW_LIKES}?${params}`);
    }
    
    async getReviewLikes(reviewId) {
        const params = new URLSearchParams({
            search: reviewId
        });
        return this.request(`${this.config.API_ENDPOINTS.REVIEW_LIKES}?${params}`);
    }
    
    // Utility Methods
    getLoggedInUser() {
        return this.config.getStorageItem(this.config.STORAGE_KEYS.USER_SESSION);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Cache Management
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.config.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }
    
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    
    clearCache() {
        this.cache.clear();
    }
    
    // Request Queue (for offline support)
    addToRequestQueue(request) {
        this.requestQueue.push(request);
    }
    
    async processRequestQueue() {
        while (this.requestQueue.length > 0 && this.isOnline) {
            const request = this.requestQueue.shift();
            try {
                await this.request(request.url, request.options);
            } catch (error) {
                console.error('Failed to process queued request:', error);
                // Re-queue if it's a network error
                if (error.message.includes('network') || error.message.includes('fetch')) {
                    this.requestQueue.unshift(request);
                    break;
                }
            }
        }
    }
    
    // Error Handling
    handleApiError(error, context = '') {
        console.error(`API Error ${context}:`, error);
        
        let userMessage = this.config.ERROR_MESSAGES.SERVER_ERROR;
        
        if (error.message.includes('network') || error.message.includes('fetch')) {
            userMessage = this.config.ERROR_MESSAGES.NETWORK_ERROR;
        } else if (error.message.includes('401')) {
            userMessage = this.config.ERROR_MESSAGES.UNAUTHORIZED;
        } else if (error.message.includes('403')) {
            userMessage = this.config.ERROR_MESSAGES.FORBIDDEN;
        } else if (error.message.includes('404')) {
            userMessage = this.config.ERROR_MESSAGES.NOT_FOUND;
        } else if (error.message.includes('timeout')) {
            userMessage = 'Request timed out. Please try again.';
        }
        
        if (window.UI && window.UI.showAlert) {
            window.UI.showAlert(userMessage, 'error');
        }
        
        return userMessage;
    }
}

// Create global API instance
window.API = new API();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}