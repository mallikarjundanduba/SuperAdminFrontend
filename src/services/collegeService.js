import apiClient from "./apiService";
import { API_ENDPOINTS } from "../constants/api";

/**
 * College service - handles college management API calls
 */
export const collegeService = {
  /**
   * Get all colleges
   * @returns {Promise<Array>}
   */
  getAllColleges: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_ALL_COLLEGES);
    return response.data;
  },

  /**
   * Get college by ID
   * @param {number} id - College ID
   * @returns {Promise<object>}
   */
  getCollegeById: async (id) => {
    const response = await apiClient.get(`${API_ENDPOINTS.GET_COLLEGE_BY_ID}/${id}`);
    return response.data;
  },

  /**
   * Create a new college
   * @param {Object} payload - {collegeName, collegeCode, dbName}
   * @returns {Promise<{message: string, college: object}>}
   */
  createCollege: async (payload) => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_COLLEGE, payload);
    return response.data;
  },

  /**
   * Update a college
   * @param {number} id - College ID
   * @param {Object} payload - {collegeName, collegeCode, dbName}
   * @returns {Promise<{message: string, college: object}>}
   */
  updateCollege: async (id, payload) => {
    const response = await apiClient.put(`${API_ENDPOINTS.UPDATE_COLLEGE}/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a college
   * @param {number} id - College ID
   * @returns {Promise<{message: string}>}
   */
  deleteCollege: async (id) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.DELETE_COLLEGE}/${id}`);
    return response.data;
  }
};

