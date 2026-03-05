import api from './api';

export const reportService = {
    getMovements: async (params = {}) => {
        const response = await api.get('/reports/movements/', { params });
        return response.data;
    },
    exportMovementsCSV: async (params = {}) => {
        const response = await api.get('/reports/movements/', {
            params: { ...params, export: 'csv' },
            responseType: 'blob'
        });
        return response.data;
    },
    exportMovementsPDF: async (params = {}) => {
        const response = await api.get('/reports/movements/', {
            params: { ...params, export: 'pdf' },
            responseType: 'blob'
        });
        return response.data;
    }
};
