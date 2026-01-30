import apiClient from "./apiService";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Role service - handles role management API calls
 */
export const roleService = {
  /**
   * Get all roles
   * @returns {Promise<Array>}
   */
  getAllRoles: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_ALL_ROLES);
    return response.data;
  },

  /**
   * Get role by ID
   * @param {string} id - Role ID
   * @returns {Promise<Object>}
   */
  getRoleById: async (id) => {
    const response = await apiClient.get(`${API_ENDPOINTS.GET_ROLE_BY_ID}/${id}`);
    return response.data;
  },

  /**
   * Create a new role
   * @param {Object} payload - {name}
   * @returns {Promise<{message: string, role: object}>}
   */
  createRole: async (payload) => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_ROLE, payload);
    return response.data;
  },

  /**
   * Update a role
   * @param {string} id - Role ID
   * @param {Object} payload - {name}
   * @returns {Promise<{message: string, role: object}>}
   */
  updateRole: async (id, payload) => {
    const response = await apiClient.put(`${API_ENDPOINTS.UPDATE_ROLE}/${id}`, payload);
    return response.data;
  },

  /**
   * Get roles by organization ID
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Array>}
   */
  getRolesByOrganizationId: async (organizationId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.GET_ROLES_BY_ORGANIZATION}/${organizationId}`);
    return response.data;
  }
};

