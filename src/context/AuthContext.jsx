import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app load
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        if (token === 'fake-jwt-token-for-ui-testing') {
          // Bypass backend check for the mock token
          setUser(JSON.parse(savedUser));
        } else {
          try {
            // Verify real token by fetching profile
            const { data } = await api.get('/auth/profile');
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
          } catch (error) {
            console.error("Token verification failed:", error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    verifyToken();

    // Listen for unauthorized events from interceptor
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    try {
      // --- TEMPORARY BYPASS FOR UI TESTING WHILE MYSQL INSTALLS ---
      if (email === 'admin@kachinn.com' && password === 'admin123') {
        const userData = { id: 1, name: 'Yash (Test Admin)', email: 'admin@kachinn.com', role: 'admin' };
        localStorage.setItem('token', 'fake-jwt-token-for-ui-testing');
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
      // ------------------------------------------------------------

      const { data } = await api.post('/auth/login', { email, password });
      
      // Save to localStorage
      localStorage.setItem('token', data.token);
      
      // Store user details without token
      const userData = { id: data.id, name: data.name, email: data.email, role: data.role };
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { oldPassword, newPassword });
      return { success: true };
    } catch (error) {
       return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to change password.' 
      };
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
