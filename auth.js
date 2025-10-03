// CineHub Authentication System
class Auth {
    constructor() {
        this.config = window.CONFIG;
        this.api = window.API;
        this.currentUser = null;
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        
        // Load existing session
        this.loadSession();
        
        // Set up session monitoring
        this.setupSessionMonitoring();
    }
    
    // Load existing session from localStorage
    loadSession() {
        const session = this.config.getStorageItem(this.config.STORAGE_KEYS.USER_SESSION);
        if (session && this.isSessionValid(session)) {
            this.currentUser = session;
            this.updateLastLogin();
            this.updateUI();
        } else {
            this.logout();
        }
    }
    
    // Check if session is still valid
    isSessionValid(session) {
        if (!session || !session.loginTime) {
            return false;
        }
        
        const now = Date.now();
        const loginTime = new Date(session.loginTime).getTime();
        return (now - loginTime) < this.sessionTimeout;
    }
    
    // Set up session monitoring
    setupSessionMonitoring() {
        // Check session validity every 5 minutes
        setInterval(() => {
            if (this.currentUser && !this.isSessionValid(this.currentUser)) {
                this.logout();
                if (window.UI && window.UI.showAlert) {
                    window.UI.showAlert('Your session has expired. Please log in again.', 'warning');
                }
            }
        }, 5 * 60 * 1000);
        
        // Update last activity on user interaction
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, () => {
                if (this.currentUser) {
                    this.updateLastActivity();
                }
            }, { passive: true });
        });
    }
    
    // Register new user
    async register(userData) {
        try {
            // Validate input data
            const validation = this.validateRegistrationData(userData);
            if (!validation.valid) {
                throw new Error(validation.errors.join(', '));
            }
            
            // Check if user already exists
            const existingUser = await this.checkUserExists(userData.email, userData.username);
            if (existingUser) {
                throw new Error('A user with this email or username already exists');
            }
            
            // Hash password (client-side hashing for demo - in production, this should be done server-side)
            const hashedPassword = await this.hashPassword(userData.password);
            
            // Prepare user data
            const newUser = {
                username: userData.username.toLowerCase(),
                email: userData.email.toLowerCase(),
                password_hash: hashedPassword,
                first_name: userData.firstName || '',
                last_name: userData.lastName || '',
                bio: '',
                favorite_genres: [],
                profile_image: '',
                join_date: new Date().toISOString(),
                last_login: new Date().toISOString(),
                is_active: true
            };
            
            // Create user in database
            const createdUser = await this.api.createUser(newUser);
            
            // Create session
            const session = this.createSession(createdUser);
            
            // Save session
            this.currentUser = session;
            this.config.setStorageItem(this.config.STORAGE_KEYS.USER_SESSION, session);
            
            // Update UI
            this.updateUI();
            
            // Show success message
            if (window.UI && window.UI.showAlert) {
                window.UI.showAlert(this.config.SUCCESS_MESSAGES.REGISTER_SUCCESS, 'success');
            }
            
            return { success: true, user: session };
            
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.message || 'Registration failed. Please try again.';
            
            if (window.UI && window.UI.showAlert) {
                window.UI.showAlert(errorMessage, 'error');
            }
            
            return { success: false, error: errorMessage };
        }
    }
    
    // Login user
    async login(credentials) {
        try {
            // Validate credentials
            if (!credentials.email || !credentials.password) {
                throw new Error('Email and password are required');
            }
            
            // Find user by email
            const userResponse = await this.api.getUserByEmail(credentials.email.toLowerCase());
            
            if (!userResponse.data || userResponse.data.length === 0) {
                throw new Error('Invalid email or password');
            }
            
            const user = userResponse.data[0];
            
            // Verify password
            const isValidPassword = await this.verifyPassword(credentials.password, user.password_hash);
            if (!isValidPassword) {
                throw new Error('Invalid email or password');
            }
            
            // Check if account is active
            if (!user.is_active) {
                throw new Error('Account is disabled. Please contact support.');
            }
            
            // Update last login
            await this.api.updateUser(user.id, {
                ...user,
                last_login: new Date().toISOString()
            });
            
            // Create session
            const session = this.createSession(user);
            
            // Save session
            this.currentUser = session;
            this.config.setStorageItem(this.config.STORAGE_KEYS.USER_SESSION, session);
            
            // Update UI
            this.updateUI();
            
            // Show success message
            if (window.UI && window.UI.showAlert) {
                window.UI.showAlert(this.config.SUCCESS_MESSAGES.LOGIN_SUCCESS, 'success');
            }
            
            return { success: true, user: session };
            
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.message || 'Login failed. Please try again.';
            
            if (window.UI && window.UI.showAlert) {
                window.UI.showAlert(errorMessage, 'error');
            }
            
            return { success: false, error: errorMessage };
        }
    }
    
    // Logout user
    logout() {
        // Clear session data
        this.currentUser = null;
        this.config.removeStorageItem(this.config.STORAGE_KEYS.USER_SESSION);
        
        // Clear API cache
        if (this.api) {
            this.api.clearCache();
        }
        
        // Update UI
        this.updateUI();
        
        // Redirect to home page if on protected page
        const protectedPages = ['profile.html', 'watchlist.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    }
    
    // Create user session
    createSession(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            profileImage: user.profile_image,
            favoriteGenres: user.favorite_genres,
            joinDate: user.join_date,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            token: this.generateToken() // Simple token for demo purposes
        };
    }
    
    // Generate simple token (in production, use proper JWT)
    generateToken() {
        return btoa(Date.now() + Math.random().toString(36)).replace(/[^a-zA-Z0-9]/g, '');
    }
    
    // Update last activity timestamp
    updateLastActivity() {
        if (this.currentUser) {
            this.currentUser.lastActivity = new Date().toISOString();
            this.config.setStorageItem(this.config.STORAGE_KEYS.USER_SESSION, this.currentUser);
        }
    }
    
    // Update last login in database
    async updateLastLogin() {
        if (this.currentUser) {
            try {
                await this.api.updateUser(this.currentUser.id, {
                    last_login: new Date().toISOString()
                });
            } catch (error) {
                console.error('Failed to update last login:', error);
            }
        }
    }
    
    // Validate registration data
    validateRegistrationData(data) {
        const errors = [];
        
        // Username validation
        const usernameValidation = this.config.validateInput('username', data.username || '');
        if (!usernameValidation.valid) {
            errors.push(...usernameValidation.errors);
        }
        
        // Email validation
        const emailValidation = this.config.validateInput('email', data.email || '');
        if (!emailValidation.valid) {
            errors.push(...emailValidation.errors);
        }
        
        // Password validation
        const passwordValidation = this.config.validateInput('password', data.password || '');
        if (!passwordValidation.valid) {
            errors.push(...passwordValidation.errors);
        }
        
        // Confirm password
        if (data.password !== data.confirmPassword) {
            errors.push('Passwords do not match');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    // Check if user exists
    async checkUserExists(email, username) {
        try {
            const emailCheck = await this.api.getUserByEmail(email);
            const usernameCheck = await this.api.request(`${this.config.API_ENDPOINTS.USERS}?search=${encodeURIComponent(username)}`);
            
            return (emailCheck.data && emailCheck.data.length > 0) || 
                   (usernameCheck.data && usernameCheck.data.length > 0);
        } catch (error) {
            console.error('Error checking user existence:', error);
            return false;
        }
    }
    
    // Hash password (simple client-side hashing for demo)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'cinehub_salt');
        const hash = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hash));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Verify password
    async verifyPassword(password, hash) {
        const hashedPassword = await this.hashPassword(password);
        return hashedPassword === hash;
    }
    
    // Update user profile
    async updateProfile(profileData) {
        try {
            if (!this.currentUser) {
                throw new Error('User not logged in');
            }
            
            // Update user in database
            const updatedUser = await this.api.updateUser(this.currentUser.id, profileData);
            
            // Update current session
            this.currentUser = {
                ...this.currentUser,
                firstName: profileData.first_name || this.currentUser.firstName,
                lastName: profileData.last_name || this.currentUser.lastName,
                profileImage: profileData.profile_image || this.currentUser.profileImage,
                favoriteGenres: profileData.favorite_genres || this.currentUser.favoriteGenres
            };
            
            // Save updated session
            this.config.setStorageItem(this.config.STORAGE_KEYS.USER_SESSION, this.currentUser);
            
            // Update UI
            this.updateUI();
            
            if (window.UI && window.UI.showAlert) {
                window.UI.showAlert(this.config.SUCCESS_MESSAGES.PROFILE_UPDATED, 'success');
            }
            
            return { success: true, user: this.currentUser };
            
        } catch (error) {
            console.error('Profile update error:', error);
            const errorMessage = error.message || 'Failed to update profile';
            
            if (window.UI && window.UI.showAlert) {
                window.UI.showAlert(errorMessage, 'error');
            }
            
            return { success: false, error: errorMessage };
        }
    }
    
    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            if (!this.currentUser) {
                throw new Error('User not logged in');
            }
            
            // Get current user data
            const userData = await this.api.getUserById(this.currentUser.id);
            
            // Verify current password
            const isValidCurrentPassword = await this.verifyPassword(currentPassword, userData.password_hash);
            if (!isValidCurrentPassword) {
                throw new Error('Current password is incorrect');
            }
            
            // Validate new password
            const passwordValidation = this.config.validateInput('password', newPassword);
            if (!passwordValidation.valid) {
                throw new Error(passwordValidation.errors.join(', '));
            }
            
            // Hash new password
            const hashedNewPassword = await this.hashPassword(newPassword);
            
            // Update password in database
            await this.api.updateUser(this.currentUser.id, {
                ...userData,
                password_hash: hashedNewPassword
            });
            
            if (window.UI && window.UI.showAlert) {
                window.UI.showAlert('Password changed successfully', 'success');
            }
            
            return { success: true };
            
        } catch (error) {
            console.error('Password change error:', error);
            const errorMessage = error.message || 'Failed to change password';
            
            if (window.UI && window.UI.showAlert) {
                window.UI.showAlert(errorMessage, 'error');
            }
            
            return { success: false, error: errorMessage };
        }
    }
    
    // Update UI based on authentication state
    updateUI() {
        const userMenuButton = document.getElementById('userMenuButton');
        const usernameElement = document.getElementById('username');
        const loginLink = document.getElementById('loginLink');
        const logoutLink = document.getElementById('logoutLink');
        
        if (this.currentUser) {
            // User is logged in
            if (usernameElement) {
                usernameElement.textContent = this.currentUser.username;
            }
            if (loginLink) {
                loginLink.style.display = 'none';
            }
            if (logoutLink) {
                logoutLink.style.display = 'block';
            }
        } else {
            // User is not logged in
            if (usernameElement) {
                usernameElement.textContent = 'Guest';
            }
            if (loginLink) {
                loginLink.style.display = 'block';
            }
            if (logoutLink) {
                logoutLink.style.display = 'none';
            }
        }
    }
    
    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
    
    // Require authentication (redirect to login if not authenticated)
    requireAuth() {
        if (!this.isLoggedIn()) {
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `pages/login.html?redirect=${currentUrl}`;
            return false;
        }
        return true;
    }
    
    // Initialize authentication events
    init() {
        // Set up logout event
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // Set up user menu dropdown
        const userMenuButton = document.getElementById('userMenuButton');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuButton && userDropdown) {
            userMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userDropdown.classList.add('hidden');
            });
        }
    }
}

// Create global Auth instance
window.AUTH = new Auth();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.AUTH.init();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}