import axios from "axios";
import tokenManager from "./tokenManager";

/**
 * Get headers with JWT token and biz token for API requests
 */
export const getHeaders = async () => {
  try {
    const token = await tokenManager.getValidToken();
    const bizToken = localStorage.getItem("authToken"); // Biz token from main app

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (bizToken) {
      headers["X-Biz-Token"] = bizToken;
    }

    return headers;
  } catch (error) {
    console.error("Failed to get headers:", error);
    return {
      "Content-Type": "application/json",
    };
  }
};

// Create axios instance for Python AI backend
const pythonAIClient = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Request interceptor - Add JWT token and biz token to all requests
pythonAIClient.interceptors.request.use(
  async (config) => {
    try {
      // Get headers with both JWT and biz tokens
      const headers = await getHeaders();
      config.headers = { ...config.headers, ...headers };

      // Add timestamps for cache busting
      config.params = { ...config.params, _t: Date.now() };

      return config;
    } catch (error) {
      console.error("Failed to set headers:", error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error),
);

// Response interceptor - Handle auth errors with retry
pythonAIClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and haven't retried yet, try refreshing token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("401 error - attempting token refresh");

        // Force token refresh
        tokenManager.clearStorage();
        await tokenManager.initialize();

        // Get new token and retry request
        const newToken = tokenManager.getCurrentToken();
        if (newToken) {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return pythonAIClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Unknown error";

    console.error("Python AI API Error:", message, error.response?.status);
    return Promise.reject(new Error(message));
  },
);

export default pythonAIClient;
