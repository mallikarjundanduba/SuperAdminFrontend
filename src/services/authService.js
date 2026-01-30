import apiClient from "./apiService";
import { API_ENDPOINTS } from "../constants/api";
import { setTokens, getRefreshToken, clearTokens } from "../utils/tokenStorage";

/**
 * Authentication service - handles all auth-related API calls
 */
export const authService = {
  /**
   * Login with email and password. Stores accessToken and refreshToken in localStorage.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{message: string, admin: object, accessToken: string, refreshToken: string}>}
   */
  login: async (email, password) => {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
      email,
      password
    });
    const data = response.data;
    if (data.accessToken != null || data.refreshToken != null) {
      setTokens(data.accessToken ?? null, data.refreshToken ?? null);
    }
    return data;
  },

  /**
   * Logout the current admin. Clears stored tokens.
   * @returns {Promise<{message: string}>}
   */
  logout: async () => {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } finally {
      clearTokens();
    }
    return { message: "Logged out" };
  },

  /**
   * Refresh access token using refreshToken from localStorage.
   * Updates stored tokens. Used by axios interceptor on 401.
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   */
  refreshAccessToken: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");
    const response = await apiClient.post(API_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
    const data = response.data;
    if (data.accessToken != null || data.refreshToken != null) {
      setTokens(data.accessToken ?? null, data.refreshToken ?? null);
    }
    return data;
  },

  /**
   * Get current admin information
   * @param {boolean} suppressLogging - If true, suppresses logging for this request (used during session check)
   * @returns {Promise<{id, email, fullName, role, organization, college}>}
   */
  getCurrentAdmin: async (suppressLogging = false) => {
    // Axios config object - pass custom flags to suppress logging
    const config = suppressLogging ? { 
      _suppressLogging: true, 
      _isSessionCheck: true 
    } : {};
    const response = await apiClient.get(API_ENDPOINTS.GET_CURRENT_ADMIN, config);
    return response.data;
  }
};

