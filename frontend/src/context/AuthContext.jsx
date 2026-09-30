import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [superAdminUser, setSuperAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [superAdminLoading, setSuperAdminLoading] = useState(true);

  // Fetch normal tenant user session
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Quick client-side expiry check to avoid unnecessary 401 requests
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setLoading(false);
        return;
      }
    } catch (_) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/user', {
        headers: { 'X-Portal': 'tenant' }
      });
      setUser(res.data);
    } catch (err) {
      console.error('Normal user session fetch failed:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch super admin session — only when a valid token exists
  const fetchSuperAdminUser = useCallback(async () => {
    const superToken = localStorage.getItem('superAdminToken');
    if (!superToken) {
      setSuperAdminUser(null);
      setSuperAdminLoading(false);
      return;
    }

    // Quick client-side expiry check to avoid unnecessary 401 requests
    try {
      const payload = JSON.parse(atob(superToken.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token already expired — clean up without hitting the server
        localStorage.removeItem('superAdminToken');
        localStorage.removeItem('superAdminRefreshToken');
        setSuperAdminUser(null);
        setSuperAdminLoading(false);
        return;
      }
    } catch (_) {
      // Malformed token — remove it
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminRefreshToken');
      setSuperAdminUser(null);
      setSuperAdminLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/user', {
        headers: { 'X-Portal': 'superadmin' }
      });
      if (res.data?.role === 'SYS_ADMIN') {
        setSuperAdminUser(res.data);
      } else {
        localStorage.removeItem('superAdminToken');
        localStorage.removeItem('superAdminRefreshToken');
        setSuperAdminUser(null);
      }
    } catch (err) {
      console.error('Super Admin session fetch failed:', err);
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminRefreshToken');
      setSuperAdminUser(null);
    } finally {
      setSuperAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchSuperAdminUser();
  }, [fetchUser, fetchSuperAdminUser]);

  // Normal login (Tenant Admin & Customer User)
  const login = async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password,
      isSuperAdminPortal: false
    });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    setUser(res.data.user);
    return res.data;
  };

  // Super Admin login (Admin@#2002 / Radiogeet@#2002)
  const loginSuperAdmin = async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password,
      isSuperAdminPortal: true
    });
    localStorage.setItem('superAdminToken', res.data.token);
    localStorage.setItem('superAdminRefreshToken', res.data.refreshToken);
    setSuperAdminUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const logoutSuperAdmin = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminRefreshToken');
    setSuperAdminUser(null);
  };

  // ============ RBAC Helpers for Normal User ============
  const isSuperAdmin = useMemo(() => user?.role === 'SYS_ADMIN', [user]);
  const isTenantAdmin = useMemo(() => user?.role === 'TENANT_ADMIN', [user]);
  const isCustomerUser = useMemo(() => user?.role === 'CUSTOMER_USER', [user]);

  const canAccessSidebarItem = useCallback((path) => {
    if (!user) return false;
    if (user.role === 'SYS_ADMIN') return true;

    const tenantAllowed = user.permissions?.tenantAllowedSidebarItems || user.Tenant?.allowedSidebarItems;
    if (tenantAllowed && Array.isArray(tenantAllowed) && !tenantAllowed.includes(path)) {
      return false;
    }

    if (user.role === 'CUSTOMER_USER') {
      const userAllowed = user.permissions?.userAllowedSidebarItems || user.allowedSidebarItems;
      if (userAllowed && Array.isArray(userAllowed) && !userAllowed.includes(path)) {
        return false;
      }
    }

    return true;
  }, [user]);

  const hasRole = useCallback((...roles) => {
    return user && roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      superAdminUser,
      loading,
      superAdminLoading,
      login,
      loginSuperAdmin,
      register,
      logout,
      logoutSuperAdmin,
      fetchUser,
      fetchSuperAdminUser,
      // RBAC helpers
      isSuperAdmin,
      isTenantAdmin,
      isCustomerUser,
      canAccessSidebarItem,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
