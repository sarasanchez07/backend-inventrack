import api from './api';

const movementService = {
    getMovements: async (params = {}) => {
        const response = await api.get('/movements/', { params });
        return response.data;
    },

    createMovement: async (data) => {
        const response = await api.post('/movements/register/', data);
        return response.data;
    },

    updateMovement: async (id, data) => {
        const response = await api.patch(`/movements/${id}/`, data);
        return response.data;
    },

    cancelMovement: async (id) => {
        const response = await api.delete(`/movements/${id}/`);
        return response.data;
    }
};

export default movementService;
