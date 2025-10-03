# CineHub Setup Guide

This guide will help you set up the CineHub movie review platform on your local machine and prepare it for deployment.

## Table of Contents
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/cinehub.git
cd cinehub

# Install development dependencies (optional)
npm install
```

### 2. Get TMDB API Key
1. Visit [The Movie Database (TMDB)](https://www.themoviedb.org/)
2. Create a free account
3. Go to Settings → API → Create → Developer
4. Fill out the form and get your API Read Access Token

### 3. Configure API Key
```bash
# Open js/config.js and replace the placeholder
# Change this line:
this.TMDB_API_KEY = 'YOUR_TMDB_API_KEY';
# To:
this.TMDB_API_KEY = 'your_actual_api_key_here';
```

### 4. Run Locally
```bash
# Option 1: Python (if installed)
python -m http.server 8000

# Option 2: Node.js Live Server
npx live-server --port=3000

# Option 3: NPM script (if package.json is set up)
npm start

# Option 4: Simply open index.html in your browser
```

### 5. Access the Application
- Python server: `http://localhost:8000`
- Live Server: `http://localhost:3000`
- Direct file: Open `index.html` in your browser

## Detailed Setup

### Prerequisites

#### Required
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge
- **Text Editor/IDE**: VS Code, Sublime Text, or similar
- **TMDB API Key**: Free registration required

#### Optional but Recommended
- **Git**: For version control
- **Node.js**: For development tools and package management
- **Python**: For local server (usually pre-installed on Mac/Linux)

### File Structure Overview

After setup, your project should look like this:

```
cinehub/
├── index.html              # Main homepage
├── README.md              # Project documentation
├── LICENSE                # MIT License
├── .gitignore            # Git ignore rules
├── package.json          # NPM configuration
│
├── css/                  # Stylesheets
│   ├── style.css         # Main styles (13KB)
│   └── responsive.css    # Responsive design (9KB)
│
├── js/                   # JavaScript modules
│   ├── config.js         # Configuration (12KB)
│   ├── api.js           # API handling (15KB)
│   ├── auth.js          # Authentication (17KB)
│   ├── ui.js            # UI utilities (20KB)
│   └── main.js          # Main app logic (18KB)
│
├── pages/               # HTML pages
│   ├── login.html       # User login (11KB)
│   ├── register.html    # Registration (20KB)
│   ├── movie-details.html # Movie details (32KB)
│   ├── profile.html     # User profile (35KB)
│   └── watchlist.html   # User watchlist (36KB)
│
└── docs/               # Documentation
    ├── API.md          # API documentation
    ├── SETUP.md        # This file
    └── DEPLOYMENT.md   # Deployment guide
```

## Configuration

### 1. TMDB API Configuration

Edit `js/config.js`:

```javascript
// Required: Replace with your actual API key
this.TMDB_API_KEY = 'your_tmdb_api_key_here';

// Optional: Customize these settings
this.DEFAULT_LANGUAGE = 'en-US';  // Language for movie data
this.DEFAULT_REGION = 'US';       // Region for release dates
this.MOVIES_PER_PAGE = 20;        // Results per page
this.REVIEWS_PER_PAGE = 10;       // Reviews per page
```

### 2. Feature Configuration

Enable/disable features as needed:

```javascript
this.FEATURES = {
    USER_AUTHENTICATION: true,    // User login/register
    MOVIE_REVIEWS: true,         // Review system
    MOVIE_RATINGS: true,         // Rating system
    WATCHLIST: true,            // User watchlists
    SOCIAL_FEATURES: true,      // Like/dislike reviews
    ADVANCED_SEARCH: true,      // Enhanced search
    USER_PROFILES: true,        // User profile pages
    DARK_THEME: true           // Dark mode support
};
```

### 3. UI Customization

Adjust UI behavior:

```javascript
this.UI_CONFIG = {
    ANIMATION_DURATION: 300,     // Animation speed (ms)
    DEBOUNCE_DELAY: 500,        // Search delay (ms)
    TOAST_DURATION: 3000,       // Alert display time (ms)
    AUTO_HIDE_ALERTS: true      // Auto-hide notifications
};
```

### 4. Validation Rules

Customize validation requirements:

```javascript
this.VALIDATION = {
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 20,
        PATTERN: /^[a-zA-Z0-9_]+$/
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBER: true
    }
};
```

## Development Workflow

### 1. Development Server

For active development, use a live server that auto-reloads:

```bash
# Install live-server globally
npm install -g live-server

# Start development server
live-server --port=3000 --open=/index.html --watch=css,js,pages

# Or use the NPM script
npm run dev
```

### 2. Code Organization

#### CSS Development
- Edit `css/style.css` for main styles
- Edit `css/responsive.css` for responsive design
- Use CSS custom properties for consistent theming

#### JavaScript Development
- `js/config.js` - Configuration and constants
- `js/api.js` - All API calls and HTTP requests
- `js/auth.js` - Authentication and user management
- `js/ui.js` - UI utilities and helper functions
- `js/main.js` - Main application logic

#### HTML Development
- `index.html` - Homepage and main navigation
- `pages/` - Individual page templates
- Keep HTML semantic and accessible

### 3. Testing Workflow

```bash
# Validate HTML
npx html-validate *.html pages/*.html

# Check JavaScript syntax
npx eslint js/**/*.js

# Format code
npx prettier --write "**/*.{html,css,js,json,md}"

# Test locally
npm start
```

### 4. Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature description"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

## Testing

### Browser Testing

Test in multiple browsers to ensure compatibility:

1. **Chrome/Chromium** (Primary development browser)
2. **Firefox** (Different rendering engine)
3. **Safari** (WebKit engine, Mac/iOS)
4. **Edge** (Windows compatibility)

### Mobile Testing

Test responsive design on various screen sizes:

```bash
# Use browser dev tools to simulate:
# - iPhone SE (375px)
# - iPhone 12 (390px)
# - iPad (768px)
# - iPad Pro (1024px)
# - Desktop (1200px+)
```

### Feature Testing

#### Authentication Flow
1. Register new user
2. Login with credentials
3. Test session persistence
4. Test logout functionality
5. Test password validation

#### Movie Features
1. Browse trending movies
2. Search for specific movies
3. View movie details
4. Rate a movie
5. Write a review
6. Add to watchlist

#### User Profile
1. Edit profile information
2. View user statistics
3. Browse user reviews
4. Manage watchlist

### API Testing

Test API integration:

```javascript
// Test in browser console
console.log('Testing TMDB API...');

// Test trending movies
API.getTrendingMovies().then(data => {
    console.log('Trending movies:', data);
}).catch(error => {
    console.error('API Error:', error);
});

// Test movie search
API.searchMovies('avengers').then(data => {
    console.log('Search results:', data);
});

// Test authentication (if user is logged in)
if (AUTH.isLoggedIn()) {
    console.log('User authenticated:', AUTH.getCurrentUser());
}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. TMDB API Key Not Working

**Problem**: Movies not loading, console shows 401 errors

**Solution**:
```bash
# Check your API key in js/config.js
# Verify it's not 'YOUR_TMDB_API_KEY'
# Get a new key from TMDB if needed
```

#### 2. CORS Errors

**Problem**: Cross-origin request errors

**Solution**:
```bash
# Don't open index.html directly in browser
# Use a local server instead:
python -m http.server 8000
# Then visit http://localhost:8000
```

#### 3. JavaScript Errors

**Problem**: Features not working, console shows errors

**Solution**:
```bash
# Check browser console (F12)
# Verify all JavaScript files are loading
# Check for syntax errors in modified files
```

#### 4. CSS Not Applied

**Problem**: Styling looks broken

**Solution**:
```bash
# Check if CSS files are loading
# Verify Tailwind CSS CDN is accessible
# Check for CSS syntax errors
```

#### 5. Images Not Loading

**Problem**: Movie posters showing as broken images

**Solution**:
```bash
# Check TMDB image URLs in browser
# Verify internet connection
# Check browser network tab for failed requests
```

### Debug Mode

Enable debug mode for troubleshooting:

```javascript
// Add to browser console
localStorage.setItem('debug', 'true');
window.location.reload();

// This will enable additional logging
```

### Performance Issues

If the app is running slowly:

1. **Check Network Tab**: Look for slow API calls
2. **Profile JavaScript**: Use browser performance tools
3. **Optimize Images**: Ensure images are not too large
4. **Check Memory Usage**: Look for memory leaks

### Development Tools

Useful browser extensions for development:

- **React Developer Tools**: For debugging (if you add React later)
- **Vue.js devtools**: For debugging (if you add Vue later)
- **Web Developer**: Various web development tools
- **ColorZilla**: Color picker and gradient generator

### Code Quality Tools

Install and configure development tools:

```bash
# Install ESLint for code quality
npm install -g eslint

# Install Prettier for code formatting
npm install -g prettier

# Install HTML validator
npm install -g html-validate
```

## Environment Setup

### VS Code Configuration

Recommended VS Code extensions:

- **Live Server**: Launch local development server
- **Prettier**: Code formatting
- **ESLint**: JavaScript linting
- **HTML CSS Support**: Enhanced HTML/CSS support
- **Auto Rename Tag**: Automatically rename paired HTML tags
- **Bracket Pair Colorizer**: Colorize matching brackets

### Git Configuration

Set up Git with proper configuration:

```bash
# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set up SSH key for GitHub (optional)
ssh-keygen -t ed25519 -C "your.email@example.com"
```

## Next Steps

After successful setup:

1. **Customize the Design**: Modify CSS to match your brand
2. **Add Features**: Implement additional functionality
3. **Improve Performance**: Optimize loading and interactions
4. **Add Tests**: Write unit and integration tests
5. **Deploy**: Follow the [Deployment Guide](DEPLOYMENT.md)

## Getting Help

If you encounter issues:

1. **Check Documentation**: Review [README.md](../README.md) and [API.md](API.md)
2. **Search Issues**: Look through GitHub issues for similar problems
3. **Create Issue**: Report bugs or request features on GitHub
4. **Community**: Join discussions in the repository

---

*Happy coding! 🎬*