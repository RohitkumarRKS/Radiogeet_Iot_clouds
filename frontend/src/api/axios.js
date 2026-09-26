import axios from 'axios';

const getApiBase = () => {
  if (typeof window === 'undefined') return 'http://localhost:2004/api';
  const { protocol, hostname, port } = window.location;
  // If running in Vite development mode on port 5173, point to backend on port 2004
  if (port === '5173') {
    return `${protocol}//${hostname}:2004/api`;
  }
  // When built and served via backend (port 2004) or behind Nginx (port 80/443), use current origin
  return `${protocol}//${hostname}${port ? `:${port}` : ''}/api`;
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
