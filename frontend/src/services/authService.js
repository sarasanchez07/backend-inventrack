import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const authService = {
    login: async (email, password) => {
        const response = await axios.post(`${API_URL}/auth/login/`, { email, password });
        if (response.data.access) {
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    forgotPassword: async (email) => {
        return axios.post(`${API_URL}/auth/password_reset/`, { email });
    }
};

export default authService;
