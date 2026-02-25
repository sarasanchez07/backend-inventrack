import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const categoryService = {
    /**
     * Lista categorías con filtros opcionales.
     * @param {Object} params - { search, inventory_id }
     */
    getCategories: async (params = {}) => {
        const response = await axios.get(`${API_URL}/inventory/categories/`, {
            headers: getAuthHeaders(),
            params,
        });
        return response.data;
    },

    /**
     * Crea una nueva categoría.
     * @param {Object} data - { name, inventory }
     */
    createCategory: async (data) => {
        const response = await axios.post(`${API_URL}/inventory/categories/`, data, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

    /**
     * Actualiza una categoría existente.
     * @param {number} id - ID de la categoría
     * @param {Object} data - { name }
     */
    updateCategory: async (id, data) => {
        const response = await axios.patch(`${API_URL}/inventory/categories/${id}/`, data, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

    /**
     * Elimina una categoría.
     * @param {number} id - ID de la categoría
     */
    deleteCategory: async (id) => {
        const response = await axios.delete(`${API_URL}/inventory/categories/${id}/`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

    /**
     * Obtiene los productos de una categoría.
     * @param {number} categoryId
     */
    getCategoryProducts: async (categoryId) => {
        const response = await axios.get(
            `${API_URL}/inventory/categories/${categoryId}/products/`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    },

    /**
     * Lista los inventarios disponibles para el usuario.
     */
    getInventories: async () => {
        const response = await axios.get(`${API_URL}/inventory/`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },
};

export default categoryService;
