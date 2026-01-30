import apiClient from "./apiService";

export const dashboardService = {
    getSuperAdminStats: async () => {
        try {
            const response = await apiClient.get('/api/dashboard/superadmin/stats');
            return response.data; // Expected { totalUsers, activeUsers, ... }
        } catch (error) {
            console.error("Error fetching SuperAdmin stats:", error);
            throw error;
        }
    },

    getDashboardTrends: async () => {
        try {
            const response = await apiClient.get('/api/dashboard/superadmin/trends');
            return response.data; // Expected { growth: [], ... }
        } catch (error) {
            console.error("Error fetching SuperAdmin trends:", error);
            throw error;
        }
    },

    getWeeklyRevenue: async (month, year) => {
        try {
            const response = await apiClient.get(`/api/dashboard/superadmin/trends/weekly?month=${month}&year=${year}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching weekly revenue:", error);
            throw error;
        }
    }
};
