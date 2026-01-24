import api from '../api/axios';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        return response.data.user;
    },
    register: async (data) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await api.put('/auth/me', data);
        return response.data;
    },
    getCurrentUser: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            return null;
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        window.location.reload();
    },
};

const createEntityService = (endpoint) => ({
    getAll: async (params) => (await api.get(endpoint, { params })).data,
    getById: async (id) => (await api.get(`${endpoint}/${id}`)).data,
    create: async (data) => (await api.post(endpoint, data)).data,
    update: async (id, data) => (await api.put(`${endpoint}/${id}`, data)).data,
    delete: async (id) => (await api.delete(`${endpoint}/${id}`)).data,
});

export const listingService = {
    // Public: Get only approved listings (for marketplace)
    getAll: async (params) => (await api.get('/listings', { params })).data,
    
    // Authenticated: Get current user's own listings (for entrepreneur dashboard)
    getMyListings: async () => (await api.get('/listings/my-listings')).data,
    
    // Admin only: Get all listings regardless of status
    getAllForAdmin: async (params) => (await api.get('/listings/all', { params })).data,
    
    // Get single listing by ID
    getById: async (id) => (await api.get(`/listings/${id}`)).data,
    
    // Entrepreneur only: Create new listing
    create: async (data) => (await api.post('/listings', data)).data,
    
    // Owner only: Update own listing (cannot change status)
    update: async (id, data) => (await api.put(`/listings/${id}`, data)).data,
    
    // Admin only: Update listing status (approve/reject)
    updateStatus: async (id, status, verification_status) => 
        (await api.put(`/listings/${id}/status`, { status, verification_status })).data,
    
    // Owner/Admin: Delete listing
    delete: async (id) => (await api.delete(`/listings/${id}`)).data,
};
export const investmentService = createEntityService('/investments');
export const kycService = createEntityService('/kyc-verifications');
export const inquiryService = createEntityService('/inquiries');
export const portfolioService = createEntityService('/portfolios');
export const analyticsService = createEntityService('/analytics');
export const documentService = createEntityService('/documents');
export const goalService = createEntityService('/goals');

export const favoriteService = {
    getAll: async (params) => (await api.get('/favorites', { params })).data,
    create: async (data) => (await api.post('/favorites', data)).data,
    delete: async (id) => (await api.delete(`/favorites/${id}`)).data,
};

export const messageService = {
    getAll: async (params) => [], // Mock for now
    create: async (data) => ({}),
};

export const integrationService = {
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    invokeLLM: async (prompt) => {
        const response = await api.post('/ai/generate', { prompt });
        return response.data.result;
    }
};
