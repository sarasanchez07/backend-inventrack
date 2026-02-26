import api from './api';

const dashboardService = {
    getStats: async (inventoryId = null) => {
        const params = inventoryId ? { inventory_id: inventoryId } : {};
        const response = await api.get('/dashboard/stats/', { params });
        return response.data;
    },
    getInventory: async (id) => {
        const response = await api.get(`/inventory/${id}/`);
        return response.data;
    },
    createInventory: async (inventoryData) => {
        const response = await api.post('/inventory/create/', inventoryData);
        return response.data;
    }
};

export default dashboardService;
