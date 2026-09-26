import axios from 'axios';

const getApiBase = () => {
  const host = (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : 'localhost';
  const protocol = (typeof window !== 'undefined' && window.location.protocol) ? window.location.protocol : 'http:';
  return `${protocol}//${host}:2004/api`;
};

const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — select appropriate token based on route / header context
api.interceptors.request.use(
  (config) => {
    const isSuperAdminCall =
      config.url?.includes('/admin') ||
      config.headers['X-Portal'] === 'superadmin' ||
      window.location.pathname.startsWith('/superadmin-portal');

    const superAdminToken = localStorage.getItem('superAdminToken');
    const normalToken = localStorage.getItem('token');

    let token = isSuperAdminCall
      ? (superAdminToken || normalToken)
      : (normalToken || superAdminToken);

    if (token) {
      config.headers['X-Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token expiry per session
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const isSuperAdminCall =
        originalRequest.url?.includes('/admin') ||
        originalRequest.headers['X-Portal'] === 'superadmin' ||
        window.location.pathname.startsWith('/superadmin-portal');

      const refreshKey = isSuperAdminCall ? 'superAdminRefreshToken' : 'refreshToken';
      const tokenKey = isSuperAdminCall ? 'superAdminToken' : 'token';
      const refreshToken = localStorage.getItem(refreshKey);

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/token/refresh`, { refreshToken });
          localStorage.setItem(tokenKey, res.data.token);
          if (res.data.refreshToken) {
            localStorage.setItem(refreshKey, res.data.refreshToken);
          }
          originalRequest.headers['X-Authorization'] = `Bearer ${res.data.token}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem(tokenKey);
          localStorage.removeItem(refreshKey);
          if (isSuperAdminCall) {
            window.location.href = '/superadmin-portal';
          } else {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem(tokenKey);
        if (isSuperAdminCall) {
          // Stay on superadmin portal
        } else {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE };
