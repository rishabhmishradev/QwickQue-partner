import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('partner_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.data.role === 'SALON_OWNER') {
            setUser(res.data.data);
          } else {
            localStorage.removeItem('partner_token');
          }
        } catch (err) {
          console.error('Session restore failed', err);
          localStorage.removeItem('partner_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user, token } = res.data.data;
        if (user.role !== 'SALON_OWNER') {
          throw new Error('Unauthorized: Salon Owner access only');
        }
        localStorage.setItem('partner_token', token);
        setUser(user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('partner_token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
