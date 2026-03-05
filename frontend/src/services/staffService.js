import api from './api';

export const staffService = {
    getAllStaff: async () => {
        const response = await api.get('/auth/personnel/create/');
        return response.data;
    },
    createStaff: async (staffData) => {
        const response = await api.post('/auth/personnel/create/', staffData);
        return response.data;
    },
    updateStaff: async (id, staffData) => {
        const response = await api.patch(`/auth/users/${id}/`, staffData);
        return response.data;
    },
    deleteStaff: async (id) => {
        const response = await api.delete(`/auth/users/${id}/`);
        return response.data;
    }
};
