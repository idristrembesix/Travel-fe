    import axios from 'axios';
    import Cookies from 'js-cookie';

    const api = axios.create({
    baseURL: 'http://localhost:3000', // Port backend NestJS
    });

    // Interceptor untuk menempelkan Token secara otomatis
    api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // <-- INI YANG PALING PENTING
    }
    return config;
    }, (error) => {
    return Promise.reject(error);
    });

    export default api;