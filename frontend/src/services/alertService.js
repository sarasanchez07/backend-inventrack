import api from './api';

const alertService = {
    getAlerts: async () => {
        try {
            const response = await api.get('/alerts/');
            return response.data;
        } catch (error) {
            console.error('Error fetching alerts:', error);
            return [];
        }
    }
};

export default alertService;
