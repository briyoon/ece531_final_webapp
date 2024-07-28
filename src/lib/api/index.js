import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    // withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('jwt');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            Cookies.remove('jwt');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export { api };