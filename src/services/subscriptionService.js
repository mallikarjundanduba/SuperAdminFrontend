import apiClient from "./apiService";

/**
 * Subscription service - handles subscription management API calls
 */
export const subscriptionService = {
    /**
     * Create a new subscription
     * @param {Object} payload - Subscription data
     * @returns {Promise<Object>}
     */
    createSubscription: async (payload) => {
        const response = await apiClient.post('/api/subscriptions', payload);
        return response.data;
    },

    /**
     * Get subscription by ID
     * @param {string} id - Subscription ID
     * @returns {Promise<Object>}
     */
    getSubscriptionById: async (id) => {
        const response = await apiClient.get(`/api/subscriptions/${id}`);
        return response.data;
    },

    /**
     * Get all subscriptions for an organization
     * @param {string} organizationId - Organization ID
     * @returns {Promise<Array>}
     */
    getSubscriptionsByOrganization: async (organizationId) => {
        const response = await apiClient.get(`/api/subscriptions/organization/${organizationId}`);
        return response.data;
    },

    /**
     * Get active subscription for an organization
     * @param {string} organizationId - Organization ID
     * @returns {Promise<Object>}
     */
    getActiveSubscription: async (organizationId) => {
        const response = await apiClient.get(`/api/subscriptions/organization/${organizationId}/active`);
        return response.data;
    },

    /**
     * Update a subscription
     * @param {string} id - Subscription ID
     * @param {Object} payload - Updated subscription data
     * @returns {Promise<Object>}
     */
    updateSubscription: async (id, payload) => {
        const response = await apiClient.put(`/api/subscriptions/${id}`, payload);
        return response.data;
    }
};
