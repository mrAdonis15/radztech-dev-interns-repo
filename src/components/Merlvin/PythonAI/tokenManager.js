/**
 * Token Manager for Python AI Backend
 * Handles JWT token lifecycle: generation, storage, refresh, and expiry checking
 */

const STORAGE_KEY_API_KEY = "python_ai_api_key";
const STORAGE_KEY_JWT_TOKEN = "python_ai_jwt_token";
const STORAGE_KEY_TOKEN_EXPIRY = "python_ai_token_expiry";
const REFRESH_BUFFER_MS = 60 * 60 * 1000; // Refresh 1 hour before expiry

class TokenManager {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.apiKey = null;
    this.jwtToken = null;
    this.tokenExpiry = null;
    this.isRefreshing = false;
    this.refreshPromise = null;

    // Load from localStorage on initialization
    this.loadFromStorage();
  }

  /**
   * Load stored credentials from localStorage
   */
  loadFromStorage() {
    try {
      this.apiKey = localStorage.getItem(STORAGE_KEY_API_KEY);
      this.jwtToken = localStorage.getItem(STORAGE_KEY_JWT_TOKEN);
      const expiryStr = localStorage.getItem(STORAGE_KEY_TOKEN_EXPIRY);
      this.tokenExpiry = expiryStr ? parseInt(expiryStr, 10) : null;
    } catch (error) {
      console.error("Error loading token from storage:", error);
    }
  }

  /**
   * Save credentials to localStorage
   */
  saveToStorage() {
    try {
      if (this.apiKey) {
        localStorage.setItem(STORAGE_KEY_API_KEY, this.apiKey);
      }
      if (this.jwtToken) {
        localStorage.setItem(STORAGE_KEY_JWT_TOKEN, this.jwtToken);
      }
      if (this.tokenExpiry) {
        localStorage.setItem(
          STORAGE_KEY_TOKEN_EXPIRY,
          this.tokenExpiry.toString(),
        );
      }
    } catch (error) {
      console.error("Error saving token to storage:", error);
    }
  }

  /**
   * Clear all stored credentials
   */
  clearStorage() {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
    localStorage.removeItem(STORAGE_KEY_JWT_TOKEN);
    localStorage.removeItem(STORAGE_KEY_TOKEN_EXPIRY);
    this.apiKey = null;
    this.jwtToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Step 1: Generate API key (one-time)
   */
  async generateApiKey() {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/generate-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to generate API key: ${response.status}`);
      }

      const data = await response.json();
      this.apiKey = data.api_key;
      this.saveToStorage();

      console.log("API key generated successfully");
      return this.apiKey;
    } catch (error) {
      console.error("Error generating API key:", error);
      throw error;
    }
  }

  /**
   * Step 2: Exchange API key for JWT token
   */
  async getJWTToken(forceRefresh = false) {
    if (!this.apiKey) {
      throw new Error("API key not found. Generate API key first.");
    }

    try {
      const response = await fetch(
        `${this.baseURL}/api/auth/token?api_key=${encodeURIComponent(this.apiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to get JWT token: ${response.status}`);
      }

      const data = await response.json();
      this.jwtToken = data.access_token;
      // expires_in is in seconds, convert to milliseconds and add to current time
      this.tokenExpiry = Date.now() + data.expires_in * 1000;
      this.saveToStorage();

      console.log("JWT token obtained successfully");
      return this.jwtToken;
    } catch (error) {
      console.error("Error getting JWT token:", error);
      throw error;
    }
  }

  /**
   * Check if token is expired or needs refresh
   */
  needsRefresh() {
    if (!this.jwtToken || !this.tokenExpiry) {
      return true;
    }
    // Refresh if less than 1 hour remaining
    return Date.now() > this.tokenExpiry - REFRESH_BUFFER_MS;
  }

  /**
   * Get valid JWT token (refresh if needed)
   */
  async getValidToken() {
    // If already refreshing, wait for that to complete
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // If token is valid and not near expiry, return it
    if (!this.needsRefresh()) {
      return this.jwtToken;
    }

    // Need to refresh
    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        // If no API key, generate one first
        if (!this.apiKey) {
          await this.generateApiKey();
        }

        // Get new JWT token
        await this.getJWTToken(true);
        return this.jwtToken;
      } catch (error) {
        console.error("Token refresh failed:", error);
        // Clear invalid credentials
        this.clearStorage();
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Initialize the token manager (call on app startup)
   */
  async initialize() {
    try {
      // Ensure we have a valid token
      await this.getValidToken();
      console.log("Token manager initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize token manager:", error);
      return false;
    }
  }

  /**
   * Get current JWT token (without refresh check)
   */
  getCurrentToken() {
    return this.jwtToken;
  }

  /**
   * Get current API key
   */
  getApiKey() {
    return this.apiKey;
  }

  /**
   * Set API key manually (if you already have one)
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.saveToStorage();
  }
}

// Create singleton instance
const tokenManager = new TokenManager("http://localhost:8000");

export default tokenManager;
