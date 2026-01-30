import apiClient from "./apiService";

/**
 * Payment service - handles payment management API calls
 */
export const paymentService = {
    /**
     * Create a new payment
     * @param {Object} payload - Payment data
     * @returns {Promise<Object>}
     */
    createPayment: async (payload) => {
        const response = await apiClient.post('/api/payments', payload);
        return response.data;
    },

    /**
     * Get payment by ID
     * @param {string} id - Payment ID
     * @returns {Promise<Object>}
     */
    getPaymentById: async (id) => {
        const response = await apiClient.get(`/api/payments/${id}`);
        return response.data;
    },

    /**
     * Get payment by invoice number
     * @param {string} invoiceNumber - Invoice number
     * @returns {Promise<Object>}
     */
    getPaymentByInvoice: async (invoiceNumber) => {
        const response = await apiClient.get(`/api/payments/invoice/${invoiceNumber}`);
        return response.data;
    },

    /**
     * Get all payments for an organization
     * @param {string} organizationId - Organization ID
     * @returns {Promise<Array>}
     */
    getPaymentsByOrganization: async (organizationId) => {
        const response = await apiClient.get(`/api/payments/organization/${organizationId}`);
        return response.data;
    },

    /**
     * Get all payments for a subscription
     * @param {string} subscriptionId - Subscription ID
     * @returns {Promise<Array>}
     */
    getPaymentsBySubscription: async (subscriptionId) => {
        const response = await apiClient.get(`/api/payments/subscription/${subscriptionId}`);
        return response.data;
    },

    /**
     * Update payment status
     * @param {string} id - Payment ID
     * @param {string} status - New payment status
     * @returns {Promise<Object>}
     */
    updatePaymentStatus: async (id, status) => {
        const response = await apiClient.patch(`/api/payments/${id}/status`, { status });
        return response.data;
    },

    /**
     * Get all payments (admin/candidates)
     * @returns {Promise<Array>}
     */
    getAllPayments: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.startDate) queryParams.append("startDate", filters.startDate);
            if (filters.endDate) queryParams.append("endDate", filters.endDate);
            if (filters.status) queryParams.append("status", filters.status);
            if (filters.paymentMethod) queryParams.append("paymentMethod", filters.paymentMethod);
            if (filters.payerType) queryParams.append("payerType", filters.payerType);
            if (filters.search) queryParams.append("search", filters.search);

            const queryString = queryParams.toString();
            const url = `/api/payments${queryString ? `?${queryString}` : ""}`;

            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching all payments:", error);
            throw error;
        }
    },

    getPaymentStats: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.startDate) queryParams.append("startDate", filters.startDate);
            if (filters.endDate) queryParams.append("endDate", filters.endDate);
            if (filters.status) queryParams.append("status", filters.status);
            if (filters.paymentMethod) queryParams.append("paymentMethod", filters.paymentMethod);
            if (filters.payerType) queryParams.append("payerType", filters.payerType);

            const queryString = queryParams.toString();
            const url = `/api/payments/stats${queryString ? `?${queryString}` : ""}`;

            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching payment stats:", error);
            throw error;
        }
    }
};
