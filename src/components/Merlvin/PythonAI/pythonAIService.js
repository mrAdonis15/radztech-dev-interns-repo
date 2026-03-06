import pythonAIClient from "./pythonAIClient";
import tokenManager from "./tokenManager";

/**
 * Send a message to the Python AI chatbot
 * @param {string} message - The user message
 * @returns {Promise} Server response with AI reply
 */
export const sendMessageToPythonAI = async (message) => {
  try {
    const response = await pythonAIClient.post("/api/chat", {
      message,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get balance information
 * @returns {Promise} Balance data
 */
export const getBalance = async () => {
  try {
    const response = await pythonAIClient.get("/api/balance");
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get inventory data
 * @returns {Promise} Inventory data
 */
export const getInventory = async () => {
  try {
    const response = await pythonAIClient.get("/api/inventory");
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Generate a chart/graph using Python AI
 * @param {string} message - Query/request for chart generation
 * @param {string} chartType - Type of chart (line, bar, pie, etc.)
 * @returns {Promise} Chart data
 */
export const generateChart = async (message, chartType = "line") => {
  try {
    const response = await pythonAIClient.post("/api/chart", {
      chart_type: chartType,
      message,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Initialize the API client (call on app startup)
 * This ensures we have a valid JWT token before making requests
 */
export const initializePythonAI = async () => {
  try {
    await tokenManager.initialize();
    return true;
  } catch (error) {
    console.error("Failed to initialize Python AI:", error);
    return false;
  }
};

/**
 * Set API key manually (if you already have one)
 */
export const setApiKey = (apiKey) => {
  tokenManager.setApiKey(apiKey);
};

/**
 * Get current API key
 */
export const getApiKey = () => {
  return tokenManager.getApiKey();
};

const pythonAIService = {
  sendMessageToPythonAI,
  getBalance,
  getInventory,
  generateChart,
  initializePythonAI,
  setApiKey,
  getApiKey,
};

export default pythonAIService;
