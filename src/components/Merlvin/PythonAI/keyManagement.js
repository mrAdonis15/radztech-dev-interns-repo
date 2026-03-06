import { generateApiKey } from "./pythonAIService";

/**
 * API Key Management utilities
 */

/**
 * Generate a new API key
 * @returns {Promise<Object>} - New API key object
 * @example
 * const newKey = await generateNewKey();
 * console.log(newKey.api_key);
 */
export const generateNewKey = async () => {
  try {
    const response = await generateApiKey();
    console.log("New API Key Generated:", response);
    return response;
  } catch (error) {
    console.error("Failed to generate API key:", error);
    throw error;
  }
};

/**
 * Update stored API key in config
 * @param {string} apiKey - The new API key
 * @param {Object} keyData - Full key data object
 */
export const updateStoredApiKey = (apiKey, keyData = {}) => {
  // Store in localStorage for persistence
  localStorage.setItem(
    "python_ai_key",
    JSON.stringify({
      api_key: apiKey,
      ...keyData,
    }),
  );
};

/**
 * Get stored API key from localStorage
 * @returns {Object|null} - Stored key data or null
 */
export const getStoredApiKey = () => {
  try {
    const stored = localStorage.getItem("python_ai_key");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error reading stored API key:", error);
    return null;
  }
};

/**
 * Clear stored API key
 */
export const clearStoredApiKey = () => {
  localStorage.removeItem("python_ai_key");
};

/**
 * Check if API key is valid/not expired
 * @param {Object} keyData - Key data object with expires_at field
 * @returns {boolean}
 */
export const isKeyValid = (keyData) => {
  if (!keyData || !keyData.expires_at) return true; // No expiration = always valid
  return new Date(keyData.expires_at) > new Date();
};

export default {
  generateNewKey,
  updateStoredApiKey,
  getStoredApiKey,
  clearStoredApiKey,
  isKeyValid,
};
