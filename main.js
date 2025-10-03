// CineHub Main Application Logic
class CineHubApp {
    constructor() {
        this.config = window.CONFIG;
        this.api = window.API;
        this.auth = window.AUTH;
        this.ui = window.UI;
        
        this.genres = [];
        this.currentPage = 1;
        this.isLoading = false;
        this.searchTimeout = null;
        
        this.init();
    }
    
    async init() {
        try {
            // Load initial data
            await this.loadGenres();
            await this.loadTrendingMovies();
            await this.loadTopRatedMovies();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup search functionality
            this.setupSearch();
            
            // Initialize hero section with random backdrop
            this.setupHeroSection();
            
            console.log('CineHub initialized successfully');
            
        } catch (error) {
            console.error('Error initializing CineHub:', error);
            this.ui.showAlert('Failed to initialize application', 'error');
        }
    }
    
    async loadGenres() {
        try {
            const response = await this.api.getMovieGenres();
            this.genres = response.genres || [];
            this.displayGenres();
        } catch (error) {
            console.error('Error loading genres:', error);
        }
    }
    
    displayGenres() {
        const container = document.getElementById('genresList');
        if (!container) return;
        
        container.innerHTML = this.genres.map(genre => `
            <button class="genre-pill hover-lift" onclick="app.exploreGenre(${genre.id}, '${genre.name}')">
                ${genre.name}
            </button>
        `).join('');
    }
    
    async loadTrendingMovies() {
        try {
            const response = await this.api.getTrendingMovies();
            this.displayMovies(response.results, 'trendingMovies');
        } catch (error) {
            console.error('Error loading trending movies:', error);
            this.showMovieLoadError('trendingMovies');
        }
    }
    
    async loadTopRatedMovies() {
        try {
            const response = await this.api.getTopRatedMovies();
            this.displayMovies(response.results, 'topRatedMovies');
        } catch (error) {
            console.error('Error loading top rated movies:', error);
            this.showMovieLoadError('topRatedMovies');
        }
    }
    
    displayMovies(movies, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = movies.slice(0, 12).map(movie => this.createMovieCard(movie)).join('');
        
        // Add loading skeletons for remaining slots
        const remainingSlots = 12 - movies.length;
        if (remainingSlots > 0) {
            for (let i = 0; i < remainingSlots; i++) {
                container.innerHTML += this.createMovieCardSkeleton();
            }
        }
    }
    
    createMovieCard(movie) {
        return `
            <div class="movie-card fade-in" onclick="app.goToMovieDetails(${movie.id})">
                <img class="movie-poster" 
                     src="${this.config.getTmdbImageUrl(movie.poster_path)}" 
                     alt="${movie.title}"
                     loading="lazy"
                     onerror="this.src='${this.config.PLACEHOLDERS.MOVIE_POSTER}'">
                
                <div class="movie-info">
                    <div class="movie-title" title="${movie.title}">
                        ${this.ui.truncateText(movie.title, 40)}
                    </div>
                    
                    <div class="movie-meta">
                        <div class="movie-rating">
                            <i class="fas fa-star"></i>
                            <span>${movie.vote_average.toFixed(1)}</span>
                        </div>
                        <div class="movie-year">
                            ${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                        </div>
                    </div>
                    
                    <div class="movie-overview">
                        ${this.ui.truncateText(movie.overview || 'No description available.', 120)}
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            onclick="event.stopPropagation(); app.toggleWatchlist(${movie.id})"
                            data-tooltip="Add to Watchlist">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    createMovieCardSkeleton() {
        return `
            <div class="movie-card loading-skeleton">
                <div class="movie-poster loading-skeleton"></div>
                <div class="movie-info">
                    <div class="movie-title loading-skeleton h-4 mb-2"></div>
                    <div class="movie-meta">
                        <div class="loading-skeleton h-3 w-16"></div>
                        <div class="loading-skeleton h-3 w-12"></div>
                    </div>
                    <div class="movie-overview">
                        <div class="loading-skeleton h-3 mb-1"></div>
                        <div class="loading-skeleton h-3 mb-1"></div>
                        <div class="loading-skeleton h-3 w-3/4"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    showMovieLoadError(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <i class="fas fa-exclamation-triangle text-4xl text-gray-500 mb-4"></i>
                <p class="text-gray-400">Failed to load movies</p>
                <button class="btn btn-secondary mt-2" onclick="window.location.reload()">
                    <i class="fas fa-refresh mr-2"></i>Try Again
                </button>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Hero section buttons
        const exploreButton = document.getElementById('exploreButton');
        if (exploreButton) {
            exploreButton.addEventListener('click', () => {
                this.ui.scrollToElement('trending', 80);
            });
        }
        
        const joinButton = document.getElementById('joinButton');
        if (joinButton) {
            joinButton.addEventListener('click', () => {
                if (this.auth.isLoggedIn()) {
                    window.location.href = 'pages/profile.html';
                } else {
                    window.location.href = 'pages/register.html';
                }
            });
        }
        
        // Search modal handlers
        const closeSearchModal = document.getElementById('closeSearchModal');
        if (closeSearchModal) {
            closeSearchModal.addEventListener('click', () => {
                this.closeSearchModal();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearchModal();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
        });
    }
    
    setupSearch() {
        const searchInputs = document.querySelectorAll('#searchInput, input[type="text"][placeholder*="Search"]');
        
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                if (query.length >= 2) {
                    clearTimeout(this.searchTimeout);
                    this.searchTimeout = setTimeout(() => {
                        this.performSearch(query);
                    }, this.config.UI_CONFIG.DEBOUNCE_DELAY);
                } else {
                    this.closeSearchModal();
                }
            });
            
            input.addEventListener('focus', () => {
                if (input.value.trim().length >= 2) {
                    this.performSearch(input.value.trim());
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = input.value.trim();
                    if (query) {
                        this.performSearch(query);
                    }
                }
            });
        });
    }
    
    async performSearch(query) {
        try {
            this.openSearchModal();
            this.showSearchLoading();
            
            const response = await this.api.searchMovies(query);
            this.displaySearchResults(response.results || []);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showSearchError();
        }
    }
    
    openSearchModal() {
        const modal = document.getElementById('searchModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    closeSearchModal() {
        const modal = document.getElementById('searchModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    showSearchLoading() {
        const container = document.getElementById('searchResults');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-3xl text-red-500 mb-4"></i>
                    <p>Searching movies...</p>
                </div>
            `;
        }
    }
    
    showSearchError() {
        const container = document.getElementById('searchResults');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-triangle text-3xl text-gray-500 mb-4"></i>
                    <p class="text-gray-400">Search failed. Please try again.</p>
                </div>
            `;
        }
    }
    
    displaySearchResults(movies) {
        const container = document.getElementById('searchResults');
        if (!container) return;
        
        if (movies.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-search text-3xl text-gray-500 mb-4"></i>
                    <p class="text-gray-400">No movies found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = movies.slice(0, 10).map(movie => `
            <div class="search-suggestion" onclick="app.goToMovieDetails(${movie.id})">
                <img class="suggestion-poster" 
                     src="${this.config.getTmdbImageUrl(movie.poster_path, 'w92')}" 
                     alt="${movie.title}"
                     onerror="this.src='${this.config.PLACEHOLDERS.MOVIE_POSTER}'">
                
                <div class="suggestion-info">
                    <h4>${this.ui.truncateText(movie.title, 50)}</h4>
                    <div class="suggestion-meta">
                        ${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'} • 
                        <i class="fas fa-star text-yellow-500"></i> ${movie.vote_average.toFixed(1)}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    setupHeroSection() {
        // Set random hero backdrop from trending movies
        this.loadTrendingMovies().then(() => {
            const heroSection = document.querySelector('.hero-section, section:first-of-type');
            if (heroSection) {
                // This could be enhanced with a rotating hero carousel
                heroSection.classList.add('hero-backdrop');
            }
        });
    }
    
    focusSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Navigation methods
    goToMovieDetails(movieId) {
        window.location.href = `pages/movie-details.html?id=${movieId}`;
    }
    
    exploreGenre(genreId, genreName) {
        // This could navigate to a genre page or filter current results
        this.ui.showAlert(`Exploring ${genreName} movies...`, 'info');
        
        // For demo, we'll just scroll to trending and show a filter message
        this.ui.scrollToElement('trending', 80);
        
        // In a full implementation, this would filter movies by genre
        setTimeout(() => {
            this.ui.showAlert(`Genre filtering would be implemented here`, 'info');
        }, 1000);
    }
    
    async toggleWatchlist(movieId) {
        if (!this.auth.isLoggedIn()) {
            this.ui.showAlert('Please log in to use watchlist', 'warning');
            return;
        }
        
        try {
            const user = this.auth.getCurrentUser();
            const isInWatchlist = await this.api.isInWatchlist(user.id, movieId);
            
            if (isInWatchlist) {
                await this.api.removeFromWatchlist(user.id, movieId);
                this.ui.showAlert('Removed from watchlist', 'success');
            } else {
                // Get movie details first
                const movieDetails = await this.api.getMovieDetails(movieId);
                
                await this.api.addToWatchlist({
                    user_id: user.id,
                    movie_id: movieId,
                    added_at: new Date().toISOString(),
                    priority: 'medium',
                    watched: false,
                    notes: ''
                });
                
                this.ui.showAlert('Added to watchlist!', 'success');
            }
            
        } catch (error) {
            console.error('Watchlist error:', error);
            this.ui.showAlert('Failed to update watchlist', 'error');
        }
    }
    
    // Utility methods
    async loadMoreMovies(section) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage++;
        
        try {
            let response;
            
            switch (section) {
                case 'trending':
                    response = await this.api.getTrendingMovies(this.currentPage);
                    break;
                case 'topRated':
                    response = await this.api.getTopRatedMovies(this.currentPage);
                    break;
                default:
                    throw new Error('Unknown section');
            }
            
            const container = document.getElementById(section + 'Movies');
            if (container && response.results) {
                response.results.forEach(movie => {
                    container.innerHTML += this.createMovieCard(movie);
                });
            }
            
        } catch (error) {
            console.error('Error loading more movies:', error);
            this.ui.showAlert('Failed to load more movies', 'error');
        } finally {
            this.isLoading = false;
        }
    }
    
    // Demo user creation for testing
    async createDemoUser() {
        try {
            const demoUserData = {
                username: 'demo_user',
                email: 'demo@cinehub.com',
                password: 'DemoPassword123',
                confirmPassword: 'DemoPassword123',
                firstName: 'Demo',
                lastName: 'User'
            };
            
            const result = await this.auth.register(demoUserData);
            
            if (result.success) {
                this.ui.showAlert('Demo user created successfully!', 'success');
            } else {
                // User might already exist, try to login
                const loginResult = await this.auth.login({
                    email: demoUserData.email,
                    password: demoUserData.password
                });
                
                if (loginResult.success) {
                    this.ui.showAlert('Logged in with demo user!', 'success');
                }
            }
            
        } catch (error) {
            console.error('Demo user creation error:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the main page
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        window.app = new CineHubApp();
    }
});

// Global app variable for access from HTML
window.CineHubApp = CineHubApp;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CineHubApp;
}

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would be registered here for offline support
        // navigator.serviceWorker.register('/sw.js');
    });
}