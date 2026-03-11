import pythonAIClient from "./pythonAIClient";
import tokenManager from "./tokenManager";

/**
 * Get user auth token from localStorage
 * This is the token from clone.ulap.biz login
 */
const getSelectedBizToken = () => {
  try {
    const raw = localStorage.getItem("selectedBiz");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    const biz = parsed?.biz ?? parsed;
    return (
      biz?.token ||
      biz?.dataAccessToken ||
      biz?.accessToken ||
      parsed?.token ||
      parsed?.dataAccessToken ||
      parsed?.accessToken ||
      parsed?.access_token ||
      parsed?.auth_token ||
      ""
    );
  } catch (_error) {
    return "";
  }
};

const getUserToken = () => {
  return (
    getSelectedBizToken() ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
};

/**
 * Send a message to the Python AI chatbot
 * @param {string} message - The user message
 * @returns {Promise} Server response with AI reply
 */
export const sendMessageToPythonAI = async (message) => {
  try {
    const userToken = getUserToken();
    const response = await pythonAIClient.post("/api/chat", {
      message,
      user_auth_token: userToken, // Pass user token in body as per backend spec
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
    const userToken = getUserToken();
    const response = await pythonAIClient.post("/api/balance", {
      data_source: "general_ledger",
      user_auth_token: userToken,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get inventory data
 * @param {string} category - Inventory category (default: 'all')
 * @returns {Promise} Inventory data
 */
export const getInventory = async (category = "all") => {
  try {
    const userToken = getUserToken();
    const response = await pythonAIClient.post("/api/inventory", {
      category,
      user_auth_token: userToken,
    });
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
    const userToken = getUserToken();
    const response = await pythonAIClient.post("/api/chart", {
      chart_type: chartType,
      message,
      user_auth_token: userToken,
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
