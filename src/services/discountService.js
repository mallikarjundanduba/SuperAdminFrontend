import axios from '../config/axiosConfig';

export const discountService = {
    getAllGroups: async () => {
        const response = await axios.get('/api/discounts/groups');
        return response.data;
    },

    validateCoupon: async (code, userId, userType) => {
        const response = await axios.post('/api/discounts/validate', {
            code,
            userId,
            userType
        });
        return response.data;
    },

    recordUsage: async (code, userId, userType) => {
        const response = await axios.post('/api/discounts/use', {
            code,
            userId,
            userType
        });
        return response.data;
    }
};
