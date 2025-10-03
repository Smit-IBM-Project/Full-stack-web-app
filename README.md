# 🎬 CineHub - Movie Review & Rating Platform

A comprehensive, full-stack movie review and rating platform that allows users to discover, rate, and review movies. Built with modern web technologies and designed for movie enthusiasts who want to share their opinions and discover new films.

## 🌟 Features

### 🎭 **Core Features**
- **Movie Discovery**: Browse trending, popular, and top-rated movies
- **Advanced Search**: Search movies by title with real-time suggestions
- **Movie Details**: Comprehensive movie information including cast, crew, and trailers
- **Genre Exploration**: Browse movies by genres with filtering capabilities
- **User Reviews**: Write, edit, and delete movie reviews with spoiler warnings
- **Rating System**: Rate movies on a 1-10 scale with visual star display
- **Personal Watchlist**: Add movies to your watchlist with priority levels and notes

### 👤 **User Management**
- **User Authentication**: Secure registration and login system
- **User Profiles**: Customizable profiles with bio and favorite genres
- **Session Management**: Persistent login sessions with automatic expiry
- **Password Security**: Client-side password hashing with strong validation
- **Profile Statistics**: Track reviews, ratings, and watchlist metrics

### 🎨 **User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, dark theme with smooth animations and transitions
- **Real-time Search**: Instant search results with debounced API calls
- **Loading States**: Skeleton screens and loading indicators for better UX
- **Error Handling**: Comprehensive error messages and fallback content
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

### 🔧 **Technical Features**
- **RESTful API Integration**: TMDB API for movie data and internal API for user data
- **Local Storage**: Persistent user preferences and session management
- **Modular Architecture**: Clean separation of concerns with ES6 modules
- **Performance Optimization**: Lazy loading, image optimization, and caching
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## 🚀 **Live Demo**

✅ **Ready to Run**: No configuration required! API key is pre-integrated.

**API Integration**: 
- Movie Data: The Movie Database (TMDB) API ✅ Configured
- User Data: Built-in RESTful Table API ✅ Ready
- Demo Users: Pre-loaded test accounts ✅ Available

## 📁 **Project Structure**

```
cinehub/
├── index.html              # Main homepage
├── README.md              # This file
├── LICENSE                # MIT License
├── .gitignore            # Git ignore rules
├── package.json          # Project dependencies (if using npm)
│
├── css/                  # Stylesheets
│   ├── style.css         # Main styles
│   └── responsive.css    # Responsive design rules
│
├── js/                   # JavaScript modules
│   ├── config.js         # Configuration and constants
│   ├── api.js           # API handling and HTTP requests
│   ├── auth.js          # Authentication and user management
│   ├── ui.js            # UI utilities and helpers
│   └── main.js          # Main application logic
│
├── pages/               # HTML pages
│   ├── login.html       # User login page
│   ├── register.html    # User registration page
│   ├── movie-details.html # Movie details and reviews
│   ├── profile.html     # User profile management
│   └── watchlist.html   # User watchlist page
│
├── images/              # Static images (if any)
│
└── docs/               # Additional documentation
    ├── API.md          # API documentation
    ├── SETUP.md        # Setup instructions
    └── DEPLOYMENT.md   # Deployment guide
```

## 🛠 **Technology Stack**

### **Frontend**
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with Flexbox, Grid, and custom properties
- **Tailwind CSS**: Utility-first CSS framework for rapid development
- **JavaScript (ES6+)**: Modern JavaScript with modules and async/await
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Web typography (Inter font family)

### **Backend/Data**
- **TMDB API**: The Movie Database API for movie information
- **RESTful Table API**: Built-in API for user data management
- **Local Storage**: Client-side data persistence
- **Session Management**: JWT-like token system for authentication

### **Development Tools**
- **Git**: Version control with semantic commit messages
- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting
- **Live Server**: Development server for testing

## ⚙️ **Installation & Setup**

### **Prerequisites**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE (VS Code recommended)
- Git for version control
- TMDB API key (free registration required)

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/yourusername/cinehub.git
cd cinehub
```

### **Step 2: API Configuration**
✅ **TMDB API Key Already Configured!**
The application is pre-configured with a working TMDB API key, so you can start using it immediately without any additional setup.

### **Step 3: Run the Application**
```bash
# Using Python (if installed)
python -m http.server 8000

# Using Node.js Live Server (if installed)
npx live-server

# Or simply open index.html in your browser
```

### **Step 4: Access the Application**
Open your browser and navigate to:
- `http://localhost:8000` (Python server)
- `http://127.0.0.1:5500` (Live Server)
- Or directly open `index.html` in your browser

### **Step 5: Test the API Integration**
To verify everything is working correctly:
1. Open `test-api.html` in your browser
2. This will test the TMDB API connection and show sample movie data
3. Try the search functionality to ensure the API is responding

### **Step 6: Try Demo Account**
The application comes with pre-configured demo users:
- **Email**: `demo@cinehub.com`
- **Password**: `password` (for demo purposes)
- Or create your own account using the registration form

## 📊 **Database Schema**

The application uses a RESTful Table API with the following data models:

### **Users Table**
- `id` (text): Unique user identifier
- `username` (text): User's chosen username
- `email` (text): User's email address
- `password_hash` (text): Hashed password for security
- `first_name` (text): User's first name
- `last_name` (text): User's last name
- `bio` (rich_text): User's biography
- `favorite_genres` (array): Array of user's favorite movie genres
- `profile_image` (text): URL to user's profile image
- `join_date` (datetime): Date when user joined
- `last_login` (datetime): User's last login timestamp
- `is_active` (bool): Whether user account is active

### **Reviews Table**
- `id` (text): Unique review identifier
- `user_id` (text): ID of user who wrote review
- `movie_id` (text): ID of reviewed movie
- `title` (text): Review title
- `content` (rich_text): Review content
- `rating` (number): User rating (1-10)
- `spoiler_warning` (bool): Whether review contains spoilers
- `likes_count` (number): Number of likes on review
- `created_at` (datetime): Review creation timestamp
- `is_featured` (bool): Whether review is featured

### **Watchlist Table**
- `id` (text): Unique watchlist entry identifier
- `user_id` (text): ID of user who added movie
- `movie_id` (text): ID of movie in watchlist
- `added_at` (datetime): When movie was added to watchlist
- `priority` (text): Priority level (high, medium, low)
- `notes` (text): User notes about the movie
- `watched` (bool): Whether user has watched the movie
- `watched_at` (datetime): When user watched the movie

## 🎯 **Current Features Status**

### ✅ **Completed Features**
1. **User Authentication System**
   - User registration with validation
   - Secure login/logout functionality
   - Session management with timeout
   - Password strength requirements

2. **Movie Discovery & Search**
   - Integration with TMDB API
   - Real-time movie search with autocomplete
   - Browse trending and top-rated movies
   - Genre-based exploration

3. **Movie Details & Information**
   - Comprehensive movie information display
   - Cast and crew information
   - Movie trailers and images
   - Related movie recommendations

4. **Review & Rating System**
   - Create, edit, and delete reviews
   - 10-point rating system with visual stars
   - Review with spoiler warnings
   - Like/dislike system for reviews

5. **User Profile Management**
   - Customizable user profiles
   - Profile statistics (reviews, ratings, watchlist count)
   - User preference settings
   - Password change functionality

6. **Personal Watchlist**
   - Add/remove movies from watchlist
   - Priority levels and personal notes
   - Mark movies as watched
   - Filter and sort watchlist items

7. **Responsive Design**
   - Mobile-first responsive design
   - Tablet and desktop optimizations
   - Touch-friendly interface
   - Accessibility features

### 🚧 **Features in Development**
1. **Social Features**
   - Follow other users
   - Activity feed
   - Review recommendations

2. **Advanced Search & Filtering**
   - Advanced search filters (year, genre, rating)
   - Sort options for movie lists
   - Search history and saved searches

3. **Enhanced User Experience**
   - Offline support with Service Worker
   - Push notifications for new releases
   - Dark/light theme toggle

### 📋 **Recommended Next Steps**

1. **Backend Enhancement**
   - Implement proper server-side authentication
   - Add email verification system
   - Create admin panel for content management

2. **Performance Optimization**
   - Implement virtual scrolling for large lists
   - Add image lazy loading optimization
   - Implement proper caching strategies

3. **Feature Expansion**
   - Add movie recommendations based on user ratings
   - Implement social sharing features
   - Add movie discussion forums

4. **Testing & Quality**
   - Add comprehensive unit tests
   - Implement end-to-end testing
   - Add performance monitoring

## 🔧 **Configuration Options**

The application can be customized through `js/config.js`:

### **API Configuration**
```javascript
TMDB_API_KEY: 'your_api_key_here'
TMDB_BASE_URL: 'https://api.themoviedb.org/3'
DEFAULT_LANGUAGE: 'en-US'
DEFAULT_REGION: 'US'
```

### **UI Configuration**
```javascript
MOVIES_PER_PAGE: 20
REVIEWS_PER_PAGE: 10
ANIMATION_DURATION: 300
DEBOUNCE_DELAY: 500
```

### **Feature Flags**
```javascript
FEATURES: {
    USER_AUTHENTICATION: true,
    MOVIE_REVIEWS: true,
    MOVIE_RATINGS: true,
    WATCHLIST: true,
    SOCIAL_FEATURES: false
}
```

## 🚀 **Deployment**

### **GitHub Pages Deployment**
1. Push your code to a GitHub repository
2. Go to repository Settings > Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://yourusername.github.io/cinehub`

### **Netlify Deployment**
1. Connect your GitHub repository to Netlify
2. Set build command: (none needed for static site)
3. Set publish directory: `/` (root)
4. Deploy automatically on git push

### **Vercel Deployment**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the setup prompts
4. Automatic deployments on git push

### **Custom Domain Setup**
1. Purchase a domain name
2. Configure DNS settings in your domain provider
3. Add custom domain in your hosting platform
4. Enable HTTPS (usually automatic)

## 🤝 **Contributing**

We welcome contributions to CineHub! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to your branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### **Development Guidelines**
- Follow existing code style and conventions
- Add comments for complex functionality
- Test your changes thoroughly
- Update documentation as needed
- Use semantic commit messages

### **Reporting Issues**
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include browser and OS information
- Add screenshots for UI issues

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **TMDB**: Movie data provided by [The Movie Database](https://www.themoviedb.org/)
- **Font Awesome**: Icons from [Font Awesome](https://fontawesome.com/)
- **Tailwind CSS**: Styling framework by [Tailwind Labs](https://tailwindcss.com/)
- **Google Fonts**: Typography from [Google Fonts](https://fonts.google.com/)

## 📧 **Support**

For support, email support@cinehub.com or join our [Discord community](https://discord.gg/cinehub).

---

**Made with ❤️ for movie enthusiasts worldwide**

*Last updated: December 2024*