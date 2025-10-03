# CineHub API Documentation

This document describes the APIs used in the CineHub application, including both external (TMDB) and internal (RESTful Table) APIs.

## Table of Contents
- [TMDB API Integration](#tmdb-api-integration)
- [Internal RESTful Table API](#internal-restful-table-api)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## TMDB API Integration

CineHub integrates with The Movie Database (TMDB) API to fetch comprehensive movie information.

### Configuration

```javascript
// In js/config.js
TMDB_API_KEY: 'your_api_key_here'
TMDB_BASE_URL: 'https://api.themoviedb.org/3'
TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p'
```

### Available Endpoints

#### 1. Trending Movies
```javascript
GET /trending/movie/week
```
**Response**: List of trending movies for the current week.

#### 2. Popular Movies
```javascript
GET /movie/popular
```
**Parameters**:
- `page` (optional): Page number (default: 1)
- `language` (optional): Language code (default: en-US)
- `region` (optional): Region code (default: US)

#### 3. Top Rated Movies
```javascript
GET /movie/top_rated
```
**Response**: List of highest-rated movies.

#### 4. Movie Details
```javascript
GET /movie/{movie_id}
```
**Parameters**:
- `append_to_response` (optional): Additional data to include (credits, videos, reviews, etc.)

**Response**:
```json
{
  "id": 550,
  "title": "Fight Club",
  "overview": "A ticking-time-bomb insomniac...",
  "release_date": "1999-10-15",
  "vote_average": 8.4,
  "vote_count": 26280,
  "runtime": 139,
  "genres": [
    {
      "id": 18,
      "name": "Drama"
    }
  ],
  "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "backdrop_path": "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg"
}
```

#### 5. Movie Search
```javascript
GET /search/movie
```
**Parameters**:
- `query`: Search query string (required)
- `page` (optional): Page number
- `include_adult` (optional): Include adult content

#### 6. Movie Genres
```javascript
GET /genre/movie/list
```
**Response**: List of available movie genres.

### Image URLs

TMDB provides image URLs that need to be constructed:

```javascript
// Poster images
https://image.tmdb.org/t/p/w500/poster_path.jpg

// Backdrop images
https://image.tmdb.org/t/p/original/backdrop_path.jpg

// Profile images
https://image.tmdb.org/t/p/w185/profile_path.jpg
```

## Internal RESTful Table API

CineHub uses a built-in RESTful Table API for managing user data, reviews, ratings, and watchlists.

### Base URL
```
/tables/{table_name}
```

### Available Tables
- `users` - User accounts and profiles
- `reviews` - Movie reviews
- `ratings` - Movie ratings
- `watchlist` - User watchlists
- `review_likes` - Review like/dislike tracking

### HTTP Methods

#### 1. List Records (GET)
```javascript
GET /tables/{table}
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 100, max: 1000)
- `search`: Search query
- `sort`: Sort field name
- `order`: Sort order (asc/desc, default: asc)

**Response**:
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 10,
  "table": "users",
  "schema": {...}
}
```

#### 2. Get Single Record (GET)
```javascript
GET /tables/{table}/{record_id}
```

**Response**:
```json
{
  "id": "uuid",
  "field1": "value1",
  "field2": "value2",
  "created_at": 1703123456789,
  "updated_at": 1703123456789
}
```

#### 3. Create Record (POST)
```javascript
POST /tables/{table}
Content-Type: application/json

{
  "field1": "value1",
  "field2": "value2"
}
```

**Response**: HTTP 201 Created with the created record.

#### 4. Update Record (PUT)
```javascript
PUT /tables/{table}/{record_id}
Content-Type: application/json

{
  "field1": "new_value1",
  "field2": "new_value2"
}
```

**Response**: Updated record object.

#### 5. Partial Update (PATCH)
```javascript
PATCH /tables/{table}/{record_id}
Content-Type: application/json

{
  "field1": "updated_value"
}
```

#### 6. Delete Record (DELETE)
```javascript
DELETE /tables/{table}/{record_id}
```

**Response**: HTTP 204 No Content (soft delete with `deleted=true` flag).

### System Fields

All records automatically include these system fields:

- `id`: Unique record identifier (UUID)
- `gs_project_id`: Project identifier
- `gs_table_name`: Table name
- `created_at`: Creation timestamp (milliseconds)
- `updated_at`: Last modification timestamp (milliseconds)

## Authentication

### Session-Based Authentication

CineHub uses a simple session-based authentication system:

```javascript
// Login
const result = await AUTH.login({
  email: 'user@example.com',
  password: 'password123'
});

// Check if user is logged in
if (AUTH.isLoggedIn()) {
  const user = AUTH.getCurrentUser();
}

// Logout
AUTH.logout();
```

### Session Storage

User sessions are stored in localStorage:

```javascript
{
  "id": "user_uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "loginTime": "2024-01-01T12:00:00.000Z",
  "token": "session_token"
}
```

### Password Security

- Passwords are hashed client-side using SHA-256
- Minimum 8 characters required
- Must contain uppercase, lowercase, and numbers
- Salt is added for additional security

## Error Handling

### API Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes

- `NETWORK_ERROR`: Connection issues
- `API_LIMIT_EXCEEDED`: Rate limit reached
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Access denied
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `SERVER_ERROR`: Internal server error

### JavaScript Error Handling

```javascript
try {
  const movies = await API.getTrendingMovies();
} catch (error) {
  if (error.message.includes('401')) {
    // Handle unauthorized
    AUTH.logout();
  } else if (error.message.includes('network')) {
    // Handle network error
    UI.showAlert('Network error. Please check your connection.', 'error');
  } else {
    // Handle generic error
    UI.showAlert('An error occurred. Please try again.', 'error');
  }
}
```

## Rate Limiting

### TMDB API Limits
- 40 requests per 10 seconds
- No daily limit for regular usage
- Image requests not counted

### Internal API
- Minimum 200ms between requests
- Client-side throttling implemented
- Automatic retry for failed requests

### Implementation

```javascript
// Rate limiting in api.js
async request(url, options = {}) {
  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - this.lastRequestTime;
  if (timeSinceLastRequest < this.minRequestInterval) {
    await this.delay(this.minRequestInterval - timeSinceLastRequest);
  }
  this.lastRequestTime = Date.now();
  
  // Make request...
}
```

## Caching Strategy

### Client-Side Caching

```javascript
// Cache GET requests for 5 minutes
const cached = this.getFromCache(url);
if (cached && Date.now() - cached.timestamp < 300000) {
  return cached.data;
}
```

### Cache Keys
- TMDB movie data: 5 minutes
- User session: Until logout
- Search results: 2 minutes
- Genre list: 1 hour

## Usage Examples

### Fetching Movie Details

```javascript
// Get movie with additional data
const movie = await API.getMovieDetails(550, {
  append_to_response: 'credits,videos,reviews,similar'
});

console.log(movie.title); // "Fight Club"
console.log(movie.credits.cast); // Array of cast members
console.log(movie.videos.results); // Array of trailers/videos
```

### Creating a Review

```javascript
const review = await API.createReview({
  user_id: 'user_uuid',
  movie_id: 550,
  title: 'Amazing Movie!',
  content: 'This movie completely changed my perspective...',
  rating: 9,
  spoiler_warning: false
});
```

### Managing Watchlist

```javascript
// Add to watchlist
await API.addToWatchlist({
  user_id: 'user_uuid',
  movie_id: 550,
  priority: 'high',
  notes: 'Must watch this weekend'
});

// Check if in watchlist
const inWatchlist = await API.isInWatchlist('user_uuid', 550);

// Mark as watched
await API.markAsWatched('user_uuid', 550);
```

### Search with Pagination

```javascript
let page = 1;
let allResults = [];

do {
  const response = await API.searchMovies('fight club', page);
  allResults.push(...response.results);
  page++;
} while (response.results.length === 20); // Continue if full page
```

## Development & Testing

### API Testing

Use browser developer tools to test API calls:

```javascript
// Test in browser console
API.getTrendingMovies().then(console.log);
API.searchMovies('avengers').then(console.log);
```

### Mock Data for Development

```javascript
// Use mock data when API is unavailable
const mockMovies = [
  {
    id: 1,
    title: 'Mock Movie',
    overview: 'Test description',
    vote_average: 8.5,
    release_date: '2024-01-01'
  }
];
```

### Error Simulation

```javascript
// Simulate network errors for testing
if (window.location.hostname === 'localhost' && Math.random() > 0.8) {
  throw new Error('Simulated network error');
}
```

## Security Considerations

### API Key Security
- TMDB API key is safe for client-side use (read-only)
- Never expose write-capable API keys in client code
- Use environment variables for sensitive keys in production

### Input Validation
- All user inputs are validated client-side
- SQL injection not applicable (using table API)
- XSS prevention through proper HTML escaping

### Authentication Security
- Session timeout after 24 hours
- Automatic logout on tab close (optional)
- Password requirements enforced
- Client-side password hashing (additional server-side hashing recommended)

---

*For more information, see the [main README](../README.md) or contact the development team.*