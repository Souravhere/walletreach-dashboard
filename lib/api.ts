import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('walletreach_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('walletreach_token');
                localStorage.removeItem('walletreach_user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// API methods
export const authAPI = {
    login: (credentials: { username: string; password: string }) =>
        api.post('/auth/login', credentials),
    me: () => api.get('/auth/me'),
};

export const usersAPI = {
    create: (data: any) => api.post('/users', data),
    getAll: () => api.get('/users'),
    getById: (id: string) => api.get(`/users/${id}`),
    update: (id: string, data: any) => api.put(`/users/${id}`, data),
    delete: (id: string) => api.delete(`/users/${id}`),
};

export const walletsAPI = {
    add: (data: any) => api.post('/wallets', data),
    getAll: () => api.get('/wallets'),
    getById: (id: string) => api.get(`/wallets/${id}`),
    update: (id: string, data: any) => api.put(`/wallets/${id}`, data),
    delete: (id: string) => api.delete(`/wallets/${id}`),
    getBalance: (id: string, tokenAddress?: string) =>
        api.get(`/wallets/${id}/balance`, { params: { tokenAddress } }),
};

export const campaignsAPI = {
    create: (data: any) => api.post('/campaigns', data),
    getAll: (params?: any) => api.get('/campaigns', { params }),
    getById: (id: string) => api.get(`/campaigns/${id}`),
    simulate: (data: any) => api.post('/campaigns/simulate', data),
    start: (id: string) => api.post(`/campaigns/${id}/start`),
    pause: (id: string) => api.post(`/campaigns/${id}/pause`),
    resume: (id: string) => api.post(`/campaigns/${id}/resume`),
    stop: (id: string) => api.post(`/campaigns/${id}/stop`),
    restart: (id: string) => api.post(`/campaigns/${id}/restart`),
    delete: (id: string) => api.delete(`/campaigns/${id}`),
};

export const alertsAPI = {
    getAll: (params?: any) => api.get('/alerts', { params }),
    getUnreadCount: () => api.get('/alerts/unread-count'),
    markAsRead: (id: string) => api.put(`/alerts/${id}/read`),
    delete: (id: string) => api.delete(`/alerts/${id}`),
};

export const logsAPI = {
    getTransactions: (params?: any) => api.get('/logs/transactions', { params }),
    getTransactionStats: (params?: any) => api.get('/logs/transactions/stats', { params }),
    getAudit: (params?: any) => api.get('/logs/audit', { params }),
};

export const analyticsAPI = {
    getCampaign: (id: string) => api.get(`/analytics/campaigns/${id}`),
    getOverview: () => api.get('/analytics/overview'),
};

export const settingsAPI = {
    emergencyStop: (reason?: string) => api.post('/settings/emergency-stop', { reason }),
    getStatus: () => api.get('/settings/status'),
};

export const systemAPI = {
    getStats: () => api.get('/system/stats'),
    getRealtime: () => api.get('/system/realtime'),
};
