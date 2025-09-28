
import axios from 'axios';

// Use relative URL - this will work for both localhost and ngrok
const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
)

export const vendorProcurementApi = {
  // Get all vendors with optional search
  getVendors: (search = '') => {
    const params = search ? { search } : {};
    return api.get('/vendor-procurement/vendors', { params });
  },

  // Get vendor details
  getVendorDetails: (vendorId) => {
    return api.get(`/vendor-procurement/vendors/${vendorId}`);
  },

  // Get procurement items for a vendor
  getVendorProcurementItems: (vendorId, filters = {}) => {
    const params = { ...filters };
    return api.get(`/vendor-procurement/vendors/${vendorId}/items`, { params });
  },

  // Get filter options (stone types, stone names)
  getFilterOptions: () => {
    return api.get('/vendor-procurement/filter-options');
  },

  // Get stone names by type
  getStoneNames: (stoneType = '') => {
    const params = stoneType ? { stoneType } : {};
    return api.get('/vendor-procurement/stones/names', { params });
  },

  // Generate PDF
  generatePDF: (data) => {
    return api.post('/vendor-procurement/pdf', data, {
      responseType: 'blob',
    });
  },

  // Health check
  healthCheck: () => {
    return api.get('/health');
  },
};

export default api;