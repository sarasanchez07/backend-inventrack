import api from './api';

const alertService = {
    getAlerts: async (inventoryId = null) => {
        try {
            const params = inventoryId ? { inventory_id: inventoryId } : {};
            const response = await api.get('/alerts/', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching alerts:', error);
            return [];
        }
    }
};

export default alertService;
