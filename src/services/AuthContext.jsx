import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('partner_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('partner_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.data.role === 'SALON_OWNER') {
            const userData = res.data.data;
            setUser(userData);
            localStorage.setItem('partner_user', JSON.stringify(userData));
          } else {
            localStorage.removeItem('partner_token');
            localStorage.removeItem('partner_user');
            setUser(null);
          }
        } catch (err) {
          console.error('Session restore validation failed', err);
          // Only clear session if it's an auth error (401/403)
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem('partner_token');
            localStorage.removeItem('partner_user');
            setUser(null);
          }
          // For other errors (network timeout etc), we keep the local user state
        }
      } else {
        setUser(null);
        localStorage.removeItem('partner_user');
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user: userData, token } = res.data.data;
        if (userData.role !== 'SALON_OWNER') {
          throw new Error('Unauthorized: Salon Owner access only');
        }
        localStorage.setItem('partner_token', token);
        localStorage.setItem('partner_user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('partner_token');
    localStorage.removeItem('partner_user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
