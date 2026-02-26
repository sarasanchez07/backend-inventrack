import api from './api';

const productService = {
    getProducts: async (params = {}) => {
        const response = await api.get('/inventory/products/', { params });
        return response.data;
    },

    getProduct: async (id) => {
        const response = await api.get(`/inventory/products/${id}/`);
        return response.data;
    },

    createProduct: async (data) => {
        const response = await api.post('/inventory/products/', data);
        return response.data;
    },

    updateProduct: async (id, data) => {
        const response = await api.patch(`/inventory/products/${id}/`, data);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await api.delete(`/inventory/products/${id}/`);
        return response.data;
    },

    // Units and Presentations for the form
    getUnits: async () => {
        const response = await api.get('/inventory/units/');
        return response.data;
    },

    getPresentations: async () => {
        const response = await api.get('/inventory/presentations/');
        return response.data;
    },

    getProductMovements: async (id) => {
        const response = await api.get('/movements/', { params: { product_id: id } });
        return response.data;
    }
};

export default productService;
