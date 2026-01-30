import apiClient from "./apiService";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Admin service - handles admin management API calls
 */
export const adminService = {
  /**
   * Get all admins
   * @returns {Promise<Array>}
   */
  getAllAdmins: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.GET_ALL_ADMINS, { params });
    return response.data;
  },

  /**
   * Create a new admin
   * @param {Object} payload - {email, password, fullName, role, organizationName}
   * @returns {Promise<{message: string, admin: object}>}
   */
  createAdmin: async (payload) => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_ADMIN, payload);
    return response.data;
  },

  /**
   * Send welcome email to admin
   * @param {string} adminId - Admin ID
   * @param {string} password - Password to include in email
   * @returns {Promise<{message: string}>}
   */
  sendWelcomeEmail: async (adminId, password) => {
    const response = await apiClient.post(API_ENDPOINTS.SEND_WELCOME, { adminId, password });
    return response.data;
  },

  /**
   * Update an admin
   * @param {number} id - Admin ID
   * @param {Object} payload - {fullName, phone, active}
   * @returns {Promise<{message: string, admin: object}>}
   */
  updateAdmin: async (id, payload) => {
    const response = await apiClient.put(`${API_ENDPOINTS.UPDATE_ADMIN}/${id}`, payload);
    return response.data;
  },

  /**
   * Delete an admin
   * @param {number} id - Admin ID
   * @returns {Promise<{message: string}>}
   */
  deleteAdmin: async (id) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.DELETE_ADMIN}/${id}`);
    return response.data;
  },

  /**
   * Get users by organization ID
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Array>}
   */
  getUsersByOrganizationId: async (organizationId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.GET_USERS_BY_ORGANIZATION}/${organizationId}`);
    return response.data;
  },

  /**
   * Activate an admin user
   * @param {string} id - Admin ID
   * @returns {Promise<{message: string, admin: object}>}
   */
  activateAdmin: async (id) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.UPDATE_ADMIN}/${id}/activate`);
    return response.data;
  },

  /**
   * Deactivate an admin user
   * @param {string} id - Admin ID
   * @returns {Promise<{message: string, admin: object}>}
   */
  deactivateAdmin: async (id) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.UPDATE_ADMIN}/${id}/deactivate`);
    return response.data;
  },

  /**
   * Get all credits
   * @returns {Promise<Array>}
   */
  getAllCredits: async () => {
    // Correct endpoint for getAllCredits
    const response = await apiClient.get('/api/credits');
    return response.data;
  },

  /**
   * Get full admin details (including org, credits, students, payments)
   * @param {string} id - Admin ID
   * @returns {Promise<Object>}
   */
  /**
   * Get full admin details (including org, credits, students, payments)
   * @param {string} id - Admin ID
   * @returns {Promise<Object>}
   */
  getAdminFullDetails: async (id) => {
    const response = await apiClient.get(`${API_ENDPOINTS.GET_ALL_ADMINS}/${id}/full-details`);
    return response.data;
  },

  /**
   * Update organization credits
   * @param {string} organizationId - Organization ID
   * @param {Object} payload - {totalInterviewCredits, totalPositionCredits, validTill, active}
   * @returns {Promise<Object>}
   */
  updateCredits: async (organizationId, payload) => {
    const response = await apiClient.put(`/api/credits/organizations/${organizationId}`, payload);
    return response.data;
  },

  /**
   * Update a payment record (automated/manual linked)
   */
  updatePayment: async (id, payload) => {
    const response = await apiClient.put(`/api/payments/${id}`, payload);
    return response.data;
  },

  /**
   * Update a manual payment request
   */
  updateManualPayment: async (id, payload) => {
    const response = await apiClient.put(`/api/payments/manual/${id}`, payload);
    return response.data;
  }
};

