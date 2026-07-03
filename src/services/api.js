import axios from 'axios';
import axiosRetry from 'axios-retry';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Pointing to our Express backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure automatic retries for idempotent requests (GET, etc.)
axiosRetry(api, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
  }
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error (no response received)
      window.dispatchEvent(new CustomEvent('api-error', { detail: { type: 'network', message: 'Network error. Please check your connection.' } }));
    } else if (error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-unauthorized'));
    } else if (error.response.status >= 500) {
      // Server error
      window.dispatchEvent(new CustomEvent('api-error', { detail: { type: 'server', message: 'Internal Server Error.' } }));
    } else {
      // Dispatch 4xx errors generically to let UI context show snackbars if needed
      window.dispatchEvent(new CustomEvent('api-error', { detail: { type: 'client', message: error.response.data?.message || 'An error occurred.' } }));
    }
    return Promise.reject(error);
  }
);

export const getDashboardAnalytics = async () => {
  const response = await api.get('/dashboard/analytics');
  return response.data;
};

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

export const generateNotifications = async () => {
  const response = await api.post('/notifications/generate');
  return response.data;
};

// Bookings API
export const getBookings = async (params) => {
  const response = await api.get('/bookings', { params });
  return response.data;
};

export const exportBookings = async (params) => {
  const response = await api.get('/bookings/export', { params });
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const updateBooking = async (id, bookingData) => {
  const response = await api.put(`/bookings/${id}`, bookingData);
  return response.data;
};

export const deleteBooking = async (id) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};

export default api;
