import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:7000',
  timeout: parseInt(process.env.REACT_APP_REQUEST_TIMEOUT) || 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    // Log slow requests in development
    if (process.env.NODE_ENV === 'development' && duration > 2000) {
      console.warn(`Slow API request: ${response.config.url} took ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/admin') {
            window.location.href = '/admin';
          }
          break;
          
        case 403:
          // Forbidden
          error.message = 'You do not have permission to perform this action';
          break;
          
        case 404:
          // Not found
          error.message = 'The requested resource was not found';
          break;
          
        case 429:
          // Rate limited
          error.message = 'Too many requests. Please try again later';
          break;
          
        case 500:
          // Server error
          error.message = 'Internal server error. Please try again later';
          break;
          
        default:
          // Use server message if available
          error.message = data?.message || data?.error || 'An unexpected error occurred';
      }
    } else if (error.request) {
      // Network error
      error.message = 'Network error. Please check your connection and try again';
    } else {
      // Request setup error
      error.message = 'Request failed. Please try again';
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
const apiService = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload file
  upload: async (url, formData, onUploadProgress) => {
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download file
  download: async (url, filename) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Specific API endpoints
export const heroAPI = {
  getAll: (params = {}) => apiService.get('/api/heroes', { params }),
  getById: (id) => apiService.get(`/api/heroes/${id}`),
  getBySlug: (slug) => apiService.get(`/api/heroes/slug/${slug}`),
  create: (data) => apiService.post('/api/heroes', data),
  update: (id, data) => apiService.patch(`/api/heroes/${id}`, data),
  delete: (id) => apiService.delete(`/api/heroes/${id}`),
};

export const newsAPI = {
  getAll: (params = {}) => apiService.get('/api/news', { params }),
  getById: (id) => apiService.get(`/api/news/${id}`),
  getBySlug: (slug) => apiService.get(`/api/news/slug/${slug}`),
  create: (data) => apiService.post('/api/news', data),
  update: (id, data) => apiService.patch(`/api/news/${id}`, data),
  delete: (id) => apiService.delete(`/api/news/${id}`),
};

export const equipmentAPI = {
  getAll: (params = {}) => apiService.get('/api/equipment', { params }),
  getById: (id) => apiService.get(`/api/equipment/${id}`),
  create: (data) => apiService.post('/api/equipment', data),
  update: (id, data) => apiService.patch(`/api/equipment/${id}`, data),
  delete: (id) => apiService.delete(`/api/equipment/${id}`),
};

export const arcanaAPI = {
  getAll: (params = {}) => apiService.get('/api/arcana', { params }),
  getById: (id) => apiService.get(`/api/arcana/${id}`),
  create: (data) => apiService.post('/api/arcana', data),
  update: (id, data) => apiService.patch(`/api/arcana/${id}`, data),
  delete: (id) => apiService.delete(`/api/arcana/${id}`),
};

export const authAPI = {
  login: (credentials) => apiService.post('/api/auth/login', credentials),
  register: (userData) => apiService.post('/api/auth/register', userData),
  getProfile: () => apiService.get('/api/auth/profile'),
  logout: () => apiService.post('/api/auth/logout'),
};

export const uploadAPI = {
  image: (file, onProgress) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiService.upload('/api/upload', formData, onProgress);
  },
};

// Utility functions
export const createCancelToken = () => axios.CancelToken.source();

export const isCancel = (error) => axios.isCancel(error);

// Cache for GET requests (simple in-memory cache)
const cache = new Map();
const CACHE_DURATION = parseInt(process.env.REACT_APP_CACHE_DURATION) || 5 * 60 * 1000; // 5 minutes

export const getCached = async (key, fetchFunction, duration = CACHE_DURATION) => {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < duration) {
    return cached.data;
  }
  
  try {
    const data = await fetchFunction();
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
    return data;
  } catch (error) {
    // If fetch fails and we have cached data, return it
    if (cached) {
      return cached.data;
    }
    throw error;
  }
};

export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

export default apiService;
