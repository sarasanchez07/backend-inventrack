import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const dashboardService = {
    getStats: async (inventoryId = null) => {
        const token = localStorage.getItem('token');
        const params = inventoryId ? { inventory_id: inventoryId } : {};
        const response = await axios.get(`${API_URL}/dashboard/stats/`, {
            headers: { Authorization: `Bearer ${token}` },
            params: params
        });
        return response.data;
    },
    createInventory: async (inventoryData) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/inventory/create/`, inventoryData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

export default dashboardService;
