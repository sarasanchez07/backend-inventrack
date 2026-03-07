import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {

        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {

            originalRequest._retry = true;

            try {

                const refresh = localStorage.getItem("refresh");

                const response = await axios.post(
                    `${API_URL}/token/refresh/`,
                    { refresh }
                );

                const newAccess = response.data.access;

                localStorage.setItem("token", newAccess);

                api.defaults.headers.Authorization = `Bearer ${newAccess}`;

                originalRequest.headers.Authorization = `Bearer ${newAccess}`;

                return api(originalRequest);

            } catch (err) {

                localStorage.removeItem("token");
                localStorage.removeItem("refresh");

                window.location.href = "/login";

                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;