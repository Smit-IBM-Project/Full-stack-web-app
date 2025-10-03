# CineHub Deployment Guide

This guide covers various deployment options for the CineHub movie review platform, from simple static hosting to more advanced setups.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Static Hosting Deployment](#static-hosting-deployment)
- [GitHub Pages](#github-pages)
- [Netlify](#netlify)
- [Vercel](#vercel)
- [Custom Domain Setup](#custom-domain-setup)
- [Performance Optimization](#performance-optimization)
- [Security Configuration](#security-configuration)
- [Monitoring and Analytics](#monitoring-and-analytics)

## Prerequisites

Before deploying, ensure you have:

1. **TMDB API Key**: Get your free API key from [TMDB](https://www.themoviedb.org/settings/api)
2. **Git Repository**: Code should be in a Git repository (GitHub recommended)
3. **Domain Name** (optional): For custom domain setup
4. **SSL Certificate** (usually automatic with hosting providers)

## Static Hosting Deployment

CineHub is a static web application that can be deployed to any static hosting service.

### Build Preparation

1. **Configure API Key**:
```javascript
// In js/config.js
this.TMDB_API_KEY = 'your_production_api_key_here';
```

2. **Optimize Images** (if any):
```bash
# Install imagemin (optional)
npm install -g imagemin-cli
imagemin images/**/* --out-dir=images/optimized
```

3. **Validate HTML**:
```bash
# Check HTML validity
npx html-validate *.html pages/*.html
```

4. **Test Locally**:
```bash
# Test with local server
python -m http.server 8000
# or
npx live-server
```

## GitHub Pages

GitHub Pages offers free hosting directly from your GitHub repository.

### Setup Steps

1. **Push to GitHub**:
```bash
git add .
git commit -m "Deploy: Prepare for GitHub Pages"
git push origin main
```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `(root)`
   - Click Save

3. **Configure Custom 404 Page** (optional):
```html
<!-- 404.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CineHub - Page Not Found</title>
    <meta http-equiv="refresh" content="0; url=/cinehub/">
</head>
<body>
    <script>
        window.location.href = '/cinehub/';
    </script>
</body>
</html>
```

4. **Update Base URLs** (if using subdirectory):
```javascript
// Update paths in config.js if deployed to subdirectory
const basePath = window.location.pathname.includes('cinehub') ? '/cinehub' : '';
```

### GitHub Pages Configuration

Create `.github/workflows/deploy.yml` for automated deployment:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run tests
      run: npm test
    
    - name: Validate HTML
      run: npx html-validate *.html pages/*.html
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

**Access URL**: `https://yourusername.github.io/repository-name/`

## Netlify

Netlify offers powerful static hosting with continuous deployment and advanced features.

### Deployment Methods

#### Option 1: Git-based Deployment

1. **Connect Repository**:
   - Visit [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository

2. **Configure Build Settings**:
   - Build command: `npm run build` (or leave empty)
   - Publish directory: `.` (root directory)
   - Branch: `main`

3. **Deploy**:
   - Click "Deploy site"
   - Netlify will assign a random subdomain

#### Option 2: Manual Deployment

1. **Build Locally**:
```bash
# No build step needed for static site
zip -r cinehub.zip . -x "node_modules/*" ".git/*"
```

2. **Upload to Netlify**:
   - Visit Netlify dashboard
   - Drag and drop your zip file
   - Site will be deployed instantly

### Netlify Configuration

Create `netlify.toml` in your root directory:

```toml
[build]
  publish = "."
  
[build.environment]
  NODE_VERSION = "16"

# Redirect rules for SPA-like behavior
[[redirects]]
  from = "/pages/*"
  to = "/pages/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 404

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; img-src 'self' https://image.tmdb.org https://via.placeholder.com; script-src 'self' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net"

# Cache static assets
[[headers]]
  for = "/css/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/js/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
```

### Environment Variables

Set environment variables in Netlify dashboard:
- `TMDB_API_KEY`: Your production API key
- `NODE_ENV`: production

**Access URL**: `https://random-name-12345.netlify.app` (customizable)

## Vercel

Vercel provides excellent performance and developer experience for static sites.

### Deployment Steps

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy from Command Line**:
```bash
# In your project directory
vercel

# Follow the prompts:
# ? Set up and deploy? Yes
# ? Which scope? (your username)
# ? What's your project's name? cinehub
# ? In which directory is your code located? ./
```

3. **Configure Project**:
```bash
# For production deployment
vercel --prod
```

### Vercel Configuration

Create `vercel.json`:

```json
{
  "name": "cinehub",
  "version": 2,
  "public": true,
  "github": {
    "enabled": true,
    "autoAlias": false
  },
  "routes": [
    {
      "src": "/pages/(.*)",
      "dest": "/pages/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/css/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/js/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Access URL**: `https://cinehub.vercel.app` or `https://cinehub-username.vercel.app`

## Custom Domain Setup

### DNS Configuration

1. **Purchase Domain**: Buy from registrar (Namecheap, GoDaddy, etc.)

2. **Configure DNS Records**:

For root domain (example.com):
```
Type: A
Name: @
Value: [Your hosting provider's IP]
TTL: 300
```

For subdomain (www.example.com):
```
Type: CNAME
Name: www
Value: your-app.netlify.app
TTL: 300
```

### Platform-Specific Setup

#### Netlify Custom Domain
1. Go to Site Settings → Domain Management
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Enable HTTPS (automatic Let's Encrypt SSL)

#### Vercel Custom Domain
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS as instructed
4. SSL is automatically configured

#### GitHub Pages Custom Domain
1. Go to Repository Settings → Pages
2. Enter custom domain in "Custom domain" field
3. Create `CNAME` file in root directory:
```
your-domain.com
```

### SSL/HTTPS Setup

Most modern hosting providers automatically provide SSL certificates:

- **Netlify**: Automatic Let's Encrypt SSL
- **Vercel**: Automatic SSL certificates
- **GitHub Pages**: Automatic SSL for custom domains

## Performance Optimization

### Image Optimization

1. **Lazy Loading**:
```javascript
// Images are already lazy loaded in the code
<img loading="lazy" src="..." alt="...">
```

2. **WebP Format** (optional):
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Fallback">
</picture>
```

### Caching Strategy

1. **Browser Caching**:
```html
<!-- In index.html -->
<meta http-equiv="Cache-Control" content="public, max-age=31536000">
```

2. **CDN Configuration**:
```javascript
// Use CDN for external libraries
<script src="https://cdn.jsdelivr.net/npm/package@version/file.min.js"></script>
```

### Minification

1. **CSS Minification**:
```bash
# Install cssnano
npm install -g cssnano-cli
cssnano css/style.css css/style.min.css
```

2. **JavaScript Minification**:
```bash
# Install terser
npm install -g terser
terser js/main.js -o js/main.min.js -c -m
```

## Security Configuration

### Content Security Policy (CSP)

Add to your HTML `<head>` or server headers:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               img-src 'self' https://image.tmdb.org https://via.placeholder.com; 
               script-src 'self' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com;">
```

### Security Headers

Configure in your hosting platform:

```
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### API Key Security

1. **Environment Variables**:
```javascript
// Don't commit API keys to git
const API_KEY = process.env.TMDB_API_KEY || 'fallback_key';
```

2. **Domain Restrictions**:
   - Configure TMDB API key to only work from your domain
   - Use referrer restrictions in TMDB settings

## Monitoring and Analytics

### Google Analytics

1. **Add Tracking Code**:
```html
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

2. **Track Events**:
```javascript
// Track movie views
gtag('event', 'movie_view', {
  'movie_id': movieId,
  'movie_title': movieTitle
});
```

### Error Monitoring

1. **Sentry Integration**:
```html
<script src="https://browser.sentry-cdn.com/7.0.0/bundle.min.js"></script>
<script>
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN'
  });
</script>
```

2. **Custom Error Tracking**:
```javascript
window.addEventListener('error', (event) => {
  // Send error to monitoring service
  console.error('Application Error:', event.error);
});
```

### Performance Monitoring

1. **Web Vitals**:
```html
<script>
  import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
</script>
```

## Deployment Checklist

### Pre-Deployment
- [ ] API keys configured for production
- [ ] All links and paths are relative
- [ ] Images optimized and compressed
- [ ] HTML validated
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Performance testing done

### Post-Deployment
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] Analytics tracking working
- [ ] Error monitoring active
- [ ] Performance metrics baseline established
- [ ] Search engine optimization implemented
- [ ] Social media meta tags added

### Ongoing Maintenance
- [ ] Regular security updates
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Feature usage analytics
- [ ] Regular backups (if applicable)

## Troubleshooting

### Common Issues

1. **API Key Not Working**:
   - Verify key is correctly set in config.js
   - Check browser console for errors
   - Ensure key has proper permissions

2. **Images Not Loading**:
   - Check TMDB image URLs
   - Verify CORS settings
   - Test with placeholder images

3. **Routing Issues**:
   - Ensure all links are relative
   - Check 404 redirect configuration
   - Verify base path settings

4. **Performance Issues**:
   - Enable browser caching
   - Optimize images
   - Minimize HTTP requests

### Debug Mode

Enable debug mode for troubleshooting:

```javascript
// In config.js
const DEBUG_MODE = window.location.hostname === 'localhost';

if (DEBUG_MODE) {
  console.log('Debug mode enabled');
  window.CONFIG = CONFIG;
  window.API = API;
  window.AUTH = AUTH;
}
```

---

*For additional support, see the [main README](../README.md) or create an issue in the GitHub repository.*