import api from './api';

const categoryService = {
    getCategories: async (params = {}) => {
        const response = await api.get('/inventory/categories/', { params });
        return response.data;
    },

    createCategory: async (data) => {
        const response = await api.post('/inventory/categories/', data);
        return response.data;
    },

    updateCategory: async (id, data) => {
        const response = await api.patch(`/inventory/categories/${id}/`, data);
        return response.data;
    },

    deleteCategory: async (id) => {
        const response = await api.delete(`/inventory/categories/${id}/`);
        return response.data;
    },

    getCategoryProducts: async (categoryId) => {
        const response = await api.get(`/inventory/categories/${categoryId}/products/`);
        return response.data;
    },

    getInventories: async () => {
        const response = await api.get('/inventory/');
        return response.data;
    },
};

export default categoryService;
