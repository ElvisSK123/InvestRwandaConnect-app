import axios from 'axios';

// API Configuration
const API_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth Service
export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('admin_token', response.data.token);
        }
        return response.data.user;
    },
    
    register: async (full_name, email, password, role = 'admin') => {
        const response = await api.post('/auth/register', { 
            full_name, 
            email, 
            password, 
            role 
        });
        if (response.data.token) {
            localStorage.setItem('admin_token', response.data.token);
        }
        return response.data.user;
    },
    
    getCurrentUser: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            localStorage.removeItem('admin_token');
            throw error;
        }
    },
    
    logout: () => {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
    }
};

// Listing Service
export const listingService = {
    getAllForAdmin: async (params) => {
        const response = await api.get('/listings/all', { params });
        return response.data;
    },
    
    updateStatus: async (id, status, verification_status) => {
        const response = await api.put(`/listings/${id}/status`, {
            status,
            verification_status
        });
        return response.data;
    }
};

export default api;
