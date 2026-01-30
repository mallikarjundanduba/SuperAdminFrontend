import apiClient from "./apiService";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Credit service - handles organization credit management for SuperAdmin
 */
export const creditService = {
    /**
     * Get credits for all organizations
     * @returns {Promise<Array>}
     */
    getAllOrganizationsCredits: async () => {
        // In many implementations, this might be the same endpoint as GET_ALL_ADMINS 
        // or a specialized organization list endpoint.
        // For now, we'll try to get all organizations from the admins list 
        // or use a dedicated credits endpoint if available.
        const response = await apiClient.get(API_ENDPOINTS.GET_CREDITS);
        return response.data;
    },

    /**
     * Get credits for a specific organization
     * @param {string} organizationId 
     * @returns {Promise<Object>}
     */
    getOrganizationCredits: async (organizationId) => {
        const response = await apiClient.get(`${API_ENDPOINTS.GET_CREDITS}/${organizationId}`);
        return response.data;
    },

    /**
     * Create credits for a new organization
     * @param {Object} payload - {organizationId, totalInterviewCredits, totalPositionCredits, utilizedInterviewCredits, utilizedPositionCredits, validTill, active}
     * @returns {Promise<Object>}
     */
    createCredits: async (payload) => {
        const response = await apiClient.post(API_ENDPOINTS.CREATE_CREDITS, payload);
        return response.data;
    },

    /**
     * Update (assign/top up) credits for an organization
     * @param {string} organizationId 
     * @param {Object} payload - {totalInterviewCredits, totalPositionCredits, validTill}
     * @returns {Promise<Object>}
     */
    updateOrganizationCredits: async (organizationId, payload) => {
        const response = await apiClient.post(`${API_ENDPOINTS.UPDATE_CREDITS}/${organizationId}`, payload);
        return response.data;
    },

    /**
     * Get all manual payment requests
     * @returns {Promise<Array>}
     */
    getAllManualRequests: async () => {
        const response = await apiClient.get("/api/payments/manual/requests");
        return response.data;
    },

    /**
     * Approve a manual payment request
     * @param {string} requestId 
     * @returns {Promise<Object>}
     */
    approveManualRequest: async (requestId) => {
        const response = await apiClient.post(`/api/payments/manual/approve/${requestId}`);
        return response.data;
    },

    /**
     * Reject a manual payment request
     * @param {string} requestId 
     * @param {string} reason 
     * @returns {Promise<Object>}
     */
    rejectManualRequest: async (requestId, reason) => {
        const response = await apiClient.post(`/api/payments/manual/reject/${requestId}`, { reason });
        return response.data;
    }
};
